import requests
from bs4 import BeautifulSoup
import re
import urllib3
import random
from datetime import datetime

# Désactiver les avertissements SSL
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Mapping des symboles pour la Bourse de Casablanca
# Prix récupérés uniquement depuis le site BVC en temps réel
BVC_SYMBOLS = {
    "IAM": {"code": "9000"},        # Maroc Telecom
    "ATW": {"code": "1"},           # Attijariwafa Bank
    "BCP": {"code": "4"},           # Banque Centrale Populaire
    "GAZ": {"code": "12300"},       # Afriquia Gaz
    "CIH": {"code": "11"},          # CIH Bank
    "CDM": {"code": "18"},          # Crédit du Maroc
    "LBL": {"code": "1200"},        # Label Vie
    "MNG": {"code": "17200"},       # Managem
    "SNI": {"code": "6"},           # SNI
    "TQM": {"code": "8"},           # Taqa Morocco
}

def get_bvc_price(symbol: str) -> float:
    """
    Récupère le prix d'une action de la Bourse de Casablanca (BVC).
    Utilise uniquement les données réelles du site BVC.
    
    Args:
        symbol: Code de l'action (ex: IAM, ATW, BCP)
    
    Returns:
        Prix de l'action en MAD
    
    Raises:
        ValueError: Si le symbole n'est pas supporté ou si le prix ne peut pas être récupéré
    """
    symbol = symbol.upper()
    
    if symbol not in BVC_SYMBOLS:
        raise ValueError(f"Symbol {symbol} not supported. Available: {', '.join(BVC_SYMBOLS.keys())}")
    
    symbol_data = BVC_SYMBOLS[symbol]
    code = symbol_data["code"]
    
    # Récupérer le prix réel depuis le site BVC (pas de fallback)
    return _fetch_real_bvc_price(code, symbol)


def _fetch_real_bvc_price(code: str, symbol: str) -> float:
    """Récupère le prix réel depuis le site de la BVC (sans fallback)"""
    # URL correcte de la Bourse de Casablanca
    url = f"https://www.casablanca-bourse.com/fr/live-market/instruments/{symbol}"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
    }
    
    try:
        r = requests.get(url, timeout=10, headers=headers, verify=False)
        
        if r.status_code != 200:
            raise ValueError(f"Erreur HTTP {r.status_code} pour {url}")
        
        soup = BeautifulSoup(r.text, "html.parser")
        
        # Chercher le prix dans différentes structures possibles
        price_element = None
        
        # Méthode 1: Chercher avec des classes/IDs spécifiques
        price_patterns = [
            {'class': re.compile(r'cours|price|dernier|last.*price', re.I)},
            {'id': re.compile(r'cours|price|dernier|last.*price', re.I)},
        ]
        
        for pattern in price_patterns:
            price_element = soup.find('span', pattern) or soup.find('div', pattern)
            if price_element:
                break
        
        # Méthode 2: Chercher dans les tableaux
        if not price_element:
            tables = soup.find_all('table')
            for table in tables:
                rows = table.find_all('tr')
                for row in rows:
                    cells = row.find_all(['td', 'th'])
                    for i, cell in enumerate(cells[:-1]):
                        text = cell.get_text(strip=True).lower()
                        if 'dernier' in text or 'cours' in text or 'last price' in text:
                            price_element = cells[i + 1]
                            break
                    if price_element:
                        break
                if price_element:
                    break
        
        if price_element:
            price_text = price_element.get_text(strip=True)
            price_text = price_text.replace(" ", "").replace(",", ".")
            price_match = re.search(r'([0-9]+\.?[0-9]*)', price_text)
            if price_match:
                price = float(price_match.group(1))
                if price > 0:
                    print(f"[BVC] Prix réel récupéré pour {symbol}: {price} MAD")
                    return price
        
        raise ValueError(f"Prix non trouvé dans la page HTML pour {symbol}")
        
    except Exception as e:
        error_msg = f"Impossible de récupérer le prix réel pour {symbol}: {str(e)}"
        print(f"[BVC] {error_msg}")
        raise ValueError(error_msg)


def get_bvc_symbols():
    """Retourne la liste des symboles BVC disponibles"""
    return list(BVC_SYMBOLS.keys())
