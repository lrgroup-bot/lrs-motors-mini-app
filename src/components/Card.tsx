export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ className = "", ...props }: CardProps) {
  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow ${className}`}
      {...props}
    />
  );
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CardHeader({ className = "", ...props }: CardHeaderProps) {
  return (
    <div
      className={`px-6 py-4 border-b border-gray-200 ${className}`}
      {...props}
    />
  );
}

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CardContent({ className = "", ...props }: CardContentProps) {
  return <div className={`px-6 py-4 ${className}`} {...props} />;
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CardFooter({ className = "", ...props }: CardFooterProps) {
  return (
    <div
      className={`px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg ${className}`}
      {...props}
    />
  );
}
