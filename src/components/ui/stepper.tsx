import * as React from "react";
import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";

export interface StepProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  completed?: boolean;
  active?: boolean;
  disabled?: boolean;
  stepNumber?: number;
}

export function Step({
  title,
  description,
  completed = false,
  active = false,
  disabled = false,
  stepNumber,
  className,
  ...props
}: StepProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 flex-col items-center gap-1 text-center",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-center">
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-medium",
            active
              ? "border-primary bg-primary text-primary-foreground"
              : completed
              ? "border-primary bg-primary text-primary-foreground"
              : "border-muted-foreground/20 bg-muted/40 text-muted-foreground"
          )}
        >
          {completed ? (
            <CheckIcon className="h-4 w-4" />
          ) : (
            <span>{stepNumber || "·"}</span>
          )}
        </div>
      </div>
      <div className="space-y-0.5">
        <h3
          className={cn(
            "text-sm font-medium",
            active ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {title}
        </h3>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}

export interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  currentStep: number;
}

export function Stepper({
  currentStep,
  className,
  children,
  ...props
}: StepperProps) {
  // Filter out only Step components and clone them with additional props
  const steps = React.Children.toArray(children).filter(
    (child) => React.isValidElement(child) && child.type === Step
  ) as React.ReactElement<StepProps>[];
  
  const stepsWithProps = steps.map((step, index) => {
    return React.cloneElement(step, {
      stepNumber: index + 1,
      completed: index < currentStep,
      active: index === currentStep,
      disabled: index > currentStep,
    });
  });

  return (
    <div
      className={cn(
        "relative flex w-full flex-row justify-between gap-1",
        className
      )}
      {...props}
    >
      {stepsWithProps.map((step, index) => (
        <React.Fragment key={index}>
          {step}
          {index < stepsWithProps.length - 1 && (
            <div className="absolute top-4 left-0 right-0 h-0.5 -z-10">
              <div
                className={cn(
                  "h-full",
                  index < currentStep
                    ? "bg-primary"
                    : "bg-muted-foreground/20"
                )}
                style={{
                  width: `calc(100% - ${8 * stepsWithProps.length}px)`,
                  margin: "0 auto",
                }}
              />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}