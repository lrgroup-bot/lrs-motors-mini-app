interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 sticky top-16 md:top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            {description && <p className="text-gray-600 mt-2">{description}</p>}
          </div>
          {children && <div className="flex items-center gap-4">{children}</div>}
        </div>
      </div>
    </div>
  );
}
