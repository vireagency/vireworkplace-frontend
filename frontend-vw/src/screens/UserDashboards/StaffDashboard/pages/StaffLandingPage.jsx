import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function StaffLandingPage() {
  const navigate = useNavigate();

  const activities = [
    {
      id: "check-in",
      title: "Check In",
      description: "Check in, log time, stay accountable",
      route: "/staff/check-in",
    },
    {
      id: "check-out",
      title: "Check Out",
      description: "Wrap up, check out, track progress",
      route: "/staff/check-out",
    },
    {
      id: "tasks",
      title: "Tasks",
      description: "View, manage, and complete tasks",
      route: "/staff/tasks",
    },
    {
      id: "evaluation",
      title: "Evaluation",
      description: "Submit and improve performance",
      route: "/staff/evaluation",
    },
  ];

  const handleCardClick = (activity) => {
    navigate(activity.route);
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Radial green glow background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0, 255, 0, 0.08) 0%, transparent 70%)",
        }}
      />

      {/* Navigation header */}
      <nav className="relative z-10 flex items-center justify-between p-6 lg:px-8">
        <div className="flex items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Vire Workplace</h1>
            <p className="text-gray-400 text-sm">Staff Portal</p>
          </div>
        </div>
        <Button 
          onClick={() => navigate("/")}
          className="bg-black border border-white/20 text-white hover:bg-primary hover:text-black cursor-pointer transition-colors duration-200"
        >
          Back to Home
        </Button>
      </nav>

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 lg:px-8 pt-16 pb-24 flex flex-col items-center justify-center">
        {/* Top Badge with Glow */}
        <div className="flex justify-center mt-2 mb-12">
          <div className="relative">
            <div
              className="absolute inset-0 blur-xl opacity-70 scale-150"
              style={{
                background:
                  "radial-gradient(ellipse, #00AA44 0%, #003300 70%, transparent 100%)",
                borderRadius: "50%",
              }}
            />
            <Badge className="mb-6 bg-primary/20 text-primary border-primary/30">
              Vire Workplace
            </Badge>
          </div>
        </div>

        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-2xl font-bold text-white mb-4">
            👋 Hi, William! Welcome to Vire Workplace
          </h1>
          <p className="text-gray-300 text-base">
            Select an activity to continue
          </p>
        </div>

        {/* Activity Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="bg-[#0A0A0A] border border-[#00FF00] rounded-xl p-6 cursor-pointer transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,0,0.4)] group"
              onClick={() => handleCardClick(activity)}
            >
              <div className="text-center">
                <h3 className="text-lg font-bold text-white mb-3">
                  {activity.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {activity.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
