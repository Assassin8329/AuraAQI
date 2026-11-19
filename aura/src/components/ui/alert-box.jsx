import { Alert, AlertTitle, AlertDescription } from "./alert";

export function AlertBox({ title, description, variant = "default" }) {
  return (
    <Alert variant={variant} className="w-full">
      {title && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
}
