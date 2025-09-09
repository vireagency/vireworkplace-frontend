import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Evaluation = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-vire flex items-center justify-center p-8">
      <Card className="bg-card border-card-border shadow-card max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-card-foreground text-center">
            Evaluation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-center">
            Performance evaluation functionality will be implemented here.
          </p>
          <div className="flex justify-center">
            <Button
              onClick={() => navigate("/staff")}
              variant="outline"
              className="border-card-border text-foreground hover:bg-secondary"
            >
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Evaluation;
