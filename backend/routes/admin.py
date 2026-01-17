from flask import Blueprint, jsonify, request
from models import db, User, UserChallenge, Plan
from functools import wraps
from werkzeug.security import generate_password_hash
from flask_jwt_extended import jwt_required, get_jwt_identity

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

def admin_required(f):
    @wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user or user.role not in ['admin', 'superadmin']:
            return jsonify({'error': 'Accès interdit'}), 403
        
        request.current_user = user
        return f(*args, **kwargs)
    return decorated_function

def superadmin_required(f):
    @wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user or user.role != 'superadmin':
            return jsonify({'error': 'Accès SUPERADMIN requis'}), 403
        
        request.current_user = user
        return f(*args, **kwargs)
    return decorated_function

@admin_bp.route('/users', methods=['GET'])
@admin_required
def get_all_users():
    """Récupérer tous les utilisateurs"""
    users = User.query.order_by(User.created_at.desc()).all()
    return jsonify({
        'users': [{
            'id': u.id,
            'email': u.email,
            'first_name': u.first_name,
            'last_name': u.last_name,
            'phone': u.phone,
            'role': u.role,
            'currency': u.currency,
            'created_at': u.created_at.isoformat() if u.created_at else None,
        } for u in users]
    }), 200

@admin_bp.route('/users/<int:user_id>', methods=['GET'])
@superadmin_required
def get_user(user_id):
    """Récupérer un utilisateur spécifique"""
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'Utilisateur non trouvé'}), 404
    
    return jsonify({
        'id': user.id,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'phone': user.phone,
        'role': user.role,
        'currency': user.currency,
        'created_at': user.created_at.isoformat() if user.created_at else None,
    }), 200

@admin_bp.route('/users', methods=['POST'])
@superadmin_required
def create_user():
    """Créer un nouvel utilisateur"""
    data = request.get_json()
    
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'error': 'Email et mot de passe requis'}), 400
    
    # Vérifier si l'utilisateur existe déjà
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Cet email est déjà utilisé'}), 400
    
    new_user = User(
        email=email,
        password_hash=generate_password_hash(password),
        first_name=data.get('first_name'),
        last_name=data.get('last_name'),
        phone=data.get('phone'),
        role=data.get('role', 'user'),
        currency=data.get('currency', 'MAD')
    )
    
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({
        'message': 'Utilisateur créé avec succès',
        'user': {
            'id': new_user.id,
            'email': new_user.email,
            'role': new_user.role
        }
    }), 201

@admin_bp.route('/users/<int:user_id>', methods=['PUT'])
@superadmin_required
def update_user(user_id):
    """Mettre à jour un utilisateur"""
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'Utilisateur non trouvé'}), 404
    
    data = request.get_json()
    
    # Mise à jour des champs
    if 'email' in data:
        # Vérifier si l'email n'est pas déjà utilisé par un autre utilisateur
        existing = User.query.filter_by(email=data['email']).first()
        if existing and existing.id != user_id:
            return jsonify({'error': 'Cet email est déjà utilisé'}), 400
        user.email = data['email']
    
    if 'first_name' in data:
        user.first_name = data['first_name']
    if 'last_name' in data:
        user.last_name = data['last_name']
    if 'phone' in data:
        user.phone = data['phone']
    if 'role' in data:
        user.role = data['role']
    if 'currency' in data:
        user.currency = data['currency']
    if 'password' in data and data['password']:
        user.password_hash = generate_password_hash(data['password'])
    
    db.session.commit()
    
    return jsonify({
        'message': 'Utilisateur mis à jour',
        'user': {
            'id': user.id,
            'email': user.email,
            'role': user.role
        }
    }), 200

@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@superadmin_required
def delete_user(user_id):
    """Supprimer un utilisateur"""
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'Utilisateur non trouvé'}), 404
    
    # Empêcher la suppression de soi-même
    if user.id == request.current_user.id:
        return jsonify({'error': 'Vous ne pouvez pas supprimer votre propre compte'}), 400
    
    db.session.delete(user)
    db.session.commit()
    
    return jsonify({'message': 'Utilisateur supprimé avec succès'}), 200

@admin_bp.route('/challenges', methods=['GET'])
@admin_required
def get_all_challenges():
    """Récupérer tous les challenges"""
    challenges = UserChallenge.query.order_by(UserChallenge.created_at.desc()).all()
    
    result = []
    for c in challenges:
        plan = Plan.query.get(c.plan_id)
        user = User.query.get(c.user_id)
        
        profit_loss = c.equity - c.starting_balance
        profit_loss_pct = (profit_loss / c.starting_balance * 100) if c.starting_balance > 0 else 0
        
        result.append({
            'id': c.id,
            'user_id': c.user_id,
            'user_email': user.email if user else None,
            'user_name': f"{user.first_name or ''} {user.last_name or ''}".strip() if user else None,
            'plan_id': c.plan_id,
            'plan_name': plan.name if plan else None,
            'status': c.status,
            'starting_balance': c.starting_balance,
            'equity': c.equity,
            'profit_loss': round(profit_loss, 2),
            'profit_loss_pct': round(profit_loss_pct, 2),
            'day_start_equity': c.day_start_equity,
            'created_at': c.created_at.isoformat() if c.created_at else None,
        })
    
    return jsonify({'challenges': result}), 200

@admin_bp.route('/challenges/<int:challenge_id>/status', methods=['PUT'])
@admin_required
def update_challenge_status(challenge_id):
    """Mettre à jour le statut d'un challenge"""
    data = request.get_json()
    new_status = data.get('status')
    
    if new_status not in ['passed', 'failed', 'active', 'pending']:
        return jsonify({'error': 'Statut invalide'}), 400
    
    challenge = UserChallenge.query.get(challenge_id)
    if not challenge:
        return jsonify({'error': 'Challenge non trouvé'}), 404
    
    challenge.status = new_status
    db.session.commit()
    
    return jsonify({
        'message': 'Statut mis à jour',
        'challenge': {
            'id': challenge.id,
            'status': challenge.status
        }
    }), 200
@admin_bp.route('/stats', methods=['GET'])
@admin_required
def get_stats():
    """Récupérer les statistiques de la plateforme"""
    
    # Statistiques utilisateurs
    total_users = User.query.count()
    users_by_role = db.session.query(
        User.role, 
        db.func.count(User.id)
    ).group_by(User.role).all()
    
    # Statistiques challenges
    total_challenges = UserChallenge.query.count()
    challenges_by_status = db.session.query(
        UserChallenge.status,
        db.func.count(UserChallenge.id)
    ).group_by(UserChallenge.status).all()
    
    # Statistiques financières
    active_challenges = UserChallenge.query.filter_by(status='active').all()
    total_equity = sum(c.equity for c in active_challenges)
    total_starting_balance = sum(c.starting_balance for c in active_challenges)
    
    # Profit/Loss total
    total_profit = 0
    total_loss = 0
    for c in active_challenges:
        pnl = c.equity - c.starting_balance
        if pnl > 0:
            total_profit += pnl
        else:
            total_loss += abs(pnl)
    
    # Statistiques par plan
    challenges_by_plan = db.session.query(
        Plan.name,
        db.func.count(UserChallenge.id)
    ).join(UserChallenge, Plan.id == UserChallenge.plan_id).group_by(Plan.name).all()
    
    # Top performers
    top_performers = db.session.query(
        User.id,
        User.email,
        User.first_name,
        User.last_name,
        UserChallenge.equity,
        UserChallenge.starting_balance,
        ((UserChallenge.equity - UserChallenge.starting_balance) / UserChallenge.starting_balance * 100).label('profit_pct')
    ).join(UserChallenge, User.id == UserChallenge.user_id).filter(
        UserChallenge.status == 'active'
    ).order_by(db.desc('profit_pct')).limit(10).all()
    
    return jsonify({
        'users': {
            'total': total_users,
            'by_role': {role: count for role, count in users_by_role}
        },
        'challenges': {
            'total': total_challenges,
            'by_status': {status: count for status, count in challenges_by_status},
            'by_plan': {plan: count for plan, count in challenges_by_plan}
        },
        'financial': {
            'total_equity': round(total_equity, 2),
            'total_starting_balance': round(total_starting_balance, 2),
            'total_profit': round(total_profit, 2),
            'total_loss': round(total_loss, 2),
            'active_challenges': len(active_challenges)
        },
        'top_performers': [{
            'id': user_id,
            'email': email,
            'name': f"{first_name or ''} {last_name or ''}".strip() or email,
            'equity': round(equity, 2),
            'starting_balance': round(starting_balance, 2),
            'profit_pct': round(profit_pct, 2)
        } for user_id, email, first_name, last_name, equity, starting_balance, profit_pct in top_performers]
    }), 200