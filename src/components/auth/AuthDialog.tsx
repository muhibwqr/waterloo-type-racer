import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SignInForm from "./SignInForm";
import SignUpForm from "./SignUpForm";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuthDialog = ({ open, onOpenChange }: AuthDialogProps) => {
  const [activeTab, setActiveTab] = useState("signin");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[500px] bg-card border-border max-h-[95vh] overflow-y-auto">
        <DialogHeader className="sticky top-0 bg-card z-10 pb-2 border-b border-border">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-foreground">
            {activeTab === "signin" ? "Sign In" : "Create Account"}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6">
            <TabsTrigger value="signin" className="text-sm sm:text-base">Sign In</TabsTrigger>
            <TabsTrigger value="signup" className="text-sm sm:text-base">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin" className="mt-0">
            <SignInForm onSuccess={() => onOpenChange(false)} />
          </TabsContent>
          
          <TabsContent value="signup" className="mt-0">
            <SignUpForm onSuccess={() => onOpenChange(false)} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;
