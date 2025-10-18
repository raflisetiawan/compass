import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import BeSpokeLogo from "@/components/BeSpokeLogo";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import MainLayout from "@/layouts/MainLayout";
import AnimatedPage from "@/components/AnimatedPage";
import { Button } from "@/components/ui/button";

const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <AnimatedPage>
        <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-4xl space-y-8">
            <Card className="w-full">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="flex items-center text-lg font-semibold text-gray-800"
                  >
                    <ArrowLeft className="mr-3 h-6 w-6" />
                    About
                  </Button>
                  <BeSpokeLogo />
                </div>
              </CardHeader>
              <CardContent className="text-gray-700 space-y-4">
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Quisque fermentum ex auctor maximus suscipit. Vivamus
                  venenatis consequat congue. Aliquam velit ex, aliquet at
                  faucibus eu, blandit non tortor. Curabitur sed turpis congue,
                  rutrum magna nec, tempor est. Fusce bibendum augue nec
                  dignissim varius. Phasellus at sodales dui. Vestibulum rutrum
                  leo est.
                </p>
                <p>
                  Ut molestie vitae nibh eu finibus. Maecenas at rhoncus leo.
                  Phasellus ultrices sapien sit amet ornare viverra. Mauris sit
                  amet ultricies libero, vitae faucibus dui. Morbi porta massa
                  ac nisl scelerisque efficitur. Sed id lectus vel arcu
                  fringilla tristique ac sit amet leo. Curabitur convallis urna
                  nec dignissim mollis. Aenean elementum porta tellus, sit amet
                  gravida purus. Donec blandit orci quis ex faucibus tempor.
                  Praesent pretium lacus vitae urna aliquam tristique.
                  Pellentesque habitant morbi tristique senectus et netus et
                  malesuada fames ac turpis egestas. Suspendisse consectetur
                  sapien ut libero sodales bibendum. Fusce ac laoreet nisl.
                </p>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Quisque fermentum ex auctor maximus suscipit. Vivamus
                  venenatis consequat congue. Aliquam velit ex, aliquet at
                  faucibus eu, blandit non tortor. Curabitur sed turpis congue,
                  rutrum magna nec, tempor est. Fusce bibendum augue nec
                  dignissim varius. Phasellus at sodales dui. Vestibulum rutrum
                  leo est.
                </p>
                <p>
                  Ut molestie vitae nibh eu finibus. Maecenas at rhoncus leo.
                  Phasellus ultrices sapien sit amet ornare viverra. Mauris sit
                  amet ultricies libero, vitae faucibus dui. Morbi porta massa
                  ac nisl scelerisque efficitur. Sed id lectus vel arcu
                  fringilla tristique ac sit amet leo. Curabitur convallis urna
                  nec dignissim mollis. Aenean elementum porta tellus, sit amet
                  gravida purus. Donec blandit orci quis ex faucibus tempor.
                  Praesent pretium lacus vitae urna aliquam tristique.
                  Pellentesque habitant morbi tristique senectus et netus et
                  malesuada fames ac turpis egestas. Suspendisse consectetur
                  sapien ut libero sodales bibendum. Fusce ac laoreet nisl.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </AnimatedPage>
    </MainLayout>
  );
};

export default AboutPage;
