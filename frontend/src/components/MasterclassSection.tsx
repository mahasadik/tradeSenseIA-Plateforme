import { GraduationCap, PlayCircle, BookOpen, Trophy, Clock, Star, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from 'react-i18next';

const MasterclassSection = () => {
  const { t } = useTranslation();
  const courses = [
    {
      title: "Trading pour Débutants",
      level: "Débutant",
      lessons: 24,
      duration: "8h",
      rating: 4.9,
      students: 12453,
      image: "📊"
    },
    {
      title: "Analyse Technique Avancée",
      level: "Avancé",
      lessons: 36,
      duration: "12h",
      rating: 4.8,
      students: 8921,
      image: "📈"
    },
    {
      title: "Gestion des Risques",
      level: "Intermédiaire",
      lessons: 18,
      duration: "6h",
      rating: 4.9,
      students: 15672,
      image: "🛡️"
    },
  ];

  const features = [
    "Cours du débutant à l'expert",
    "Analyse technique & fondamentale",
    "Webinaires en direct avec des pros",
    "Parcours IA personnalisés",
    "Quiz et défis pratiques",
    "Certificats de réussite"
  ];

  return (
    <section id="masterclass" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
            <GraduationCap className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">{t('masterclass.title')}</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            {t('masterclass.subtitle')} <span className="text-gradient">Experts</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Une académie complète avec des cours premium pour devenir un trader confiant et rentable
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {courses.map((course, index) => (
            <div
              key={index}
              className="glass rounded-2xl overflow-hidden hover:border-primary/30 transition-all duration-300 group"
            >
              {/* Course Image */}
              <div className="h-48 bg-gradient-to-br from-primary/20 to-success/20 flex items-center justify-center text-6xl">
                {course.image}
              </div>

              {/* Course Content */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${course.level === "Débutant" ? "bg-success/20 text-success" :
                      course.level === "Intermédiaire" ? "bg-warning/20 text-warning" :
                        "bg-primary/20 text-primary"
                    }`}>
                    {course.level}
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-warning fill-warning" />
                    <span className="text-sm font-semibold">{course.rating}</span>
                  </div>
                </div>

                <h3 className="text-lg font-semibold mb-3 group-hover:text-primary transition-colors">
                  {course.title}
                </h3>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    <span>{course.lessons} leçons</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{course.duration}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <span className="text-sm text-muted-foreground">
                    {course.students.toLocaleString()} étudiants
                  </span>
                  <Button variant="ghost" size="sm" className="group-hover:text-primary">
                    <PlayCircle className="w-4 h-4 mr-1" />
                    Commencer
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="glass rounded-2xl p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold mb-6">
                Tout ce dont vous avez besoin pour <span className="text-gradient">réussir</span>
              </h3>
              <div className="grid gap-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-success" />
                    </div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center md:text-right">
              <div className="inline-block glass rounded-2xl p-8">
                <div className="text-5xl font-bold text-gradient mb-2">150+</div>
                <div className="text-muted-foreground mb-6">Cours Premium Disponibles</div>
                <Button variant="hero" size="lg">
                  Explorer l'Académie
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MasterclassSection;
