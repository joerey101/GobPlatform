export default function SupervisorPage() {
    return (
        <main style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Inter, sans-serif'
        }}>
            <div style={{ textAlign: 'center', color: 'white' }}>
                <div style={{
                    width: 64, height: 64,
                    borderRadius: 16,
                    background: 'rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 24px',
                    fontSize: 28
                }}>
                    📊
                </div>
                <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
                    Panel de Supervisión
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 4 }}>
                    GobPlatform — BI & Analytics
                </p>
                <p style={{
                    color: 'rgba(255,255,255,0.3)',
                    fontSize: 12,
                    marginTop: 32,
                    padding: '8px 20px',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: 8,
                    display: 'inline-block'
                }}>
                    Disponible en Fase 6
                </p>
            </div>
        </main>
    )
}
