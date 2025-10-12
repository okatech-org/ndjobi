import { useEffect, useState } from "react";
import { Users, AlertCircle, CheckCircle, DollarSign } from "lucide-react";

const StatsSection = () => {
  const [counts, setCounts] = useState({
    users: 0,
    reports: 0,
    resolution: 0,
    savings: 0,
  });

  const finalValues = {
    users: 127543,
    reports: 8926,
    resolution: 73,
    savings: 45.7,
  };

  useEffect(() => {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const interval = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      
      setCounts({
        users: Math.floor(finalValues.users * progress),
        reports: Math.floor(finalValues.reports * progress),
        resolution: Math.floor(finalValues.resolution * progress),
        savings: Number((finalValues.savings * progress).toFixed(1)),
      });

      if (step >= steps) {
        clearInterval(timer);
        setCounts({
          users: finalValues.users,
          reports: finalValues.reports,
          resolution: finalValues.resolution,
          savings: finalValues.savings,
        });
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const stats = [
    {
      icon: Users,
      label: "Utilisateurs actifs",
      value: counts.users.toLocaleString(),
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: AlertCircle,
      label: "Signalements traités",
      value: counts.reports.toLocaleString(),
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      icon: CheckCircle,
      label: "Taux de résolution",
      value: `${counts.resolution}%`,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: DollarSign,
      label: "Économies estimées",
      value: `${counts.savings}Mds FCFA`,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
  ];

  return (
    <section id="statistiques" className="container py-16">
      <div className="text-center mb-12 space-y-4">
        <h2 className="text-3xl md:text-4xl font-bold">Impact en temps réel</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Ensemble, nous construisons un Gabon plus transparent
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="relative group"
            >
              <div className="p-6 rounded-2xl border-2 border-border bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                <div className={`inline-flex p-3 rounded-xl ${stat.bgColor} mb-4`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="text-3xl md:text-4xl font-bold mb-2 tabular-nums">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default StatsSection;
