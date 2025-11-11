import { Star } from "lucide-react";

const Testimonial = () => {
  return (
    <section className="py-20 bg-background-section">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* Quotation Marks */}
          <div className="text-6xl text-gold font-serif">"</div>

          {/* Testimonial Text */}
          <blockquote className="text-2xl md:text-3xl italic text-foreground-secondary leading-relaxed">
            WaterlooType turned our study sessions into a friendly competition. The leaderboard keeps us motivated—shoutout to the Diamond tier grinders in E7!
          </blockquote>

          {/* Attribution */}
          <p className="text-foreground-muted">— Anonymous, Diamond Tier</p>

          {/* Stars */}
          <div className="flex justify-center gap-1 pt-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 text-gold fill-gold" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonial;
