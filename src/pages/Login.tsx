import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { LogIn, Car, Loader2 } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            navigate('/');
            toast({
                title: 'Bem-vindo!',
                description: 'Login realizado com sucesso.',
            });
        } catch (error: any) {
            toast({
                title: 'Erro no login',
                description: error.message || 'Verifique suas credenciais.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0B0F1A] p-4 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />

            <div className="w-full max-w-md space-y-8 relative">
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-white border border-border shadow-lg mb-2 overflow-hidden">
                        <img src="/logo.jpg" alt="LS Office Logo" className="h-full w-full object-contain" />
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
                        LSI <span className="text-primary font-light not-italic">FLEET</span>
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium tracking-wide">
                        Acesse o portal de gestão de frotas
                    </p>
                </div>

                <div className="bg-[#151B2B]/60 backdrop-blur-xl border border-white/5 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <form onSubmit={handleLogin} className="space-y-6 relative">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest pl-1">
                                E-mail
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="nome@exemplo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-12 bg-[#0B0F1A]/50 border-white/5 focus:border-primary/50 text-white placeholder:text-muted-foreground/30 rounded-2xl transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest pl-1">
                                Senha
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="h-12 bg-[#0B0F1A]/50 border-white/5 focus:border-primary/50 text-white placeholder:text-muted-foreground/30 rounded-2xl transition-all"
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20 group active:scale-[0.98] transition-all"
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    <LogIn className="h-5 w-5 mr-2 group-hover:translate-x-1 transition-transform" />
                                    Entrar
                                </>
                            )}
                        </Button>
                    </form>
                </div>

                <p className="text-center text-[10px] text-muted-foreground/40 font-bold uppercase tracking-[0.3em]">
                    LSI Solutions &copy; 2026
                </p>
            </div>
        </div>
    );
};

export default Login;
