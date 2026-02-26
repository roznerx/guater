interface CardProps {
  children: React.ReactNode
  className?: string
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`
        bg-white dark:bg-dark-card
        border-2 border-blue-deep dark:border-dark-border
        rounded-2xl shadow-[5px_5px_0_#0D4F78]
        p-6
        ${className}
      `}
    >
      {children}
    </div>
  )
}
