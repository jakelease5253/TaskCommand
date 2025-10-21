import TaskCommandLogo from '../ui/TaskCommandLogo';

export default function LoginScreen({ onLogin, loading }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-6">
            <TaskCommandLogo size="lg" />
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-2">TaskCommand</h1>
          <p className="text-slate-600">Focus. Track. Command your tasks.</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
          <button 
            onClick={onLogin} 
            disabled={loading} 
            className="w-full gradient-primary text-white py-4 px-6 rounded-xl hover:shadow-lg transition-all font-medium text-lg disabled:opacity-50"
            style={{boxShadow: loading ? 'none' : '0 4px 12px rgba(59, 130, 246, 0.4)'}}
          >
            {loading ? 'Signing In...' : 'Sign in with Microsoft'}
          </button>
          <p className="text-xs text-slate-500 text-center mt-4">Secure authentication via Microsoft</p>
        </div>
      </div>
    </div>
  );
}