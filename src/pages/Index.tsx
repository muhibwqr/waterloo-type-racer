import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import SignupForm from "@/components/SignupForm";
import WhyJoin from "@/components/WhyJoin";
import Testimonial from "@/components/Testimonial";
import Leaderboard from "@/components/Leaderboard";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <HowItWorks />
      <SignupForm />
      <WhyJoin />
      <Testimonial />
      <Leaderboard />
      <Footer />
    </div>
  );
};

export default Index;
