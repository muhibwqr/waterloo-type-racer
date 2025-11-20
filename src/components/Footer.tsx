import { Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-background mt-auto">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="text-center md:text-left">
            <p>© 2025 Muhib Waqar. All rights reserved.</p>
          </div>
          <div className="text-center md:text-right">
            <p>
              If you don't see your school, or want a feature fixed, please{" "}
              <a
                href="mailto:contact@goosetype.com"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                <Mail className="w-3 h-3" />
                reach out
              </a>
              , or if you want your company listed as a sponsor.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

