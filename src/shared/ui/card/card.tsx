import { type HTMLAttributes, forwardRef } from "react";

import styles from "./card.module.css";

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export const Card = forwardRef<HTMLDivElement, CardProps>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={`${styles.card} ${className ?? ""}`} {...props}>
    {children}
  </div>
));

Card.displayName = "Card";

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={`${styles.cardHeader} ${className ?? ""}`} {...props}>
      {children}
    </div>
  ),
);

CardHeader.displayName = "CardHeader";

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, children, ...props }, ref) => (
    <h3 ref={ref} className={`${styles.cardTitle} ${className ?? ""}`} {...props}>
      {children}
    </h3>
  ),
);

CardTitle.displayName = "CardTitle";

interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

export const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, children, ...props }, ref) => (
    <p ref={ref} className={`${styles.cardDescription} ${className ?? ""}`} {...props}>
      {children}
    </p>
  ),
);

CardDescription.displayName = "CardDescription";

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={`${styles.cardContent} ${className ?? ""}`} {...props}>
      {children}
    </div>
  ),
);

CardContent.displayName = "CardContent";

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={`${styles.cardFooter} ${className ?? ""}`} {...props}>
      {children}
    </div>
  ),
);

CardFooter.displayName = "CardFooter";
