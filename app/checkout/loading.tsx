export default function CheckoutLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-zinc-50 to-green-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-zinc-600">Preparando checkout...</p>
      </div>
    </div>
  )
}
