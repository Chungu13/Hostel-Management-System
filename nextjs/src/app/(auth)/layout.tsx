export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 bg-[#f7f7f5]"
      style={{
        backgroundImage:
          'radial-gradient(circle at 10% 20%, rgba(134,197,152,0.12) 0%, transparent 50%), radial-gradient(circle at 90% 80%, rgba(134,197,152,0.08) 0%, transparent 50%)',
      }}
    >
      {children}
    </div>
  )
}
