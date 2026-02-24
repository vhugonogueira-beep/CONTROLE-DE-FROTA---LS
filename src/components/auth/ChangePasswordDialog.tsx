import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KeyRound, Loader2, Eye, EyeOff } from 'lucide-react';

interface ChangePasswordDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { toast } = useToast();

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast({
                title: 'Erro de validação',
                description: 'As senhas não coincidem.',
                variant: 'destructive',
            });
            return;
        }

        if (password.length < 6) {
            toast({
                title: 'Senha muito curta',
                description: 'A senha deve ter pelo menos 6 caracteres.',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            toast({
                title: 'Senha atualizada!',
                description: 'Sua senha foi alterada com sucesso.',
            });

            setPassword('');
            setConfirmPassword('');
            onOpenChange(false);
        } catch (error: any) {
            toast({
                title: 'Erro ao atualizar senha',
                description: error.message || 'Ocorreu um erro ao tentar alterar sua senha.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px] border-0 shadow-2xl p-0 overflow-hidden">
                <div className="bg-primary p-6 text-white text-center">
                    <div className="mx-auto w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm">
                        <KeyRound className="h-6 w-6 text-white" />
                    </div>
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black uppercase tracking-tighter text-white text-center">Alterar Senha</DialogTitle>
                        <DialogDescription className="text-white/80 font-medium text-center">
                            Crie uma nova senha de acesso segura.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="new-password">Nova Senha</Label>
                        <div className="relative">
                            <Input
                                id="new-password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Mínimo 6 caracteres"
                                className="h-11 pr-10 border-border/50 bg-muted/30 font-semibold"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                        <Input
                            id="confirm-password"
                            type={showPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Repita a nova senha"
                            className="h-11 border-border/50 bg-muted/30 font-semibold"
                            required
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            className="flex-1 font-bold uppercase tracking-wider"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 h-11 font-black uppercase tracking-widest shadow-lg shadow-primary/20"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processando
                                </>
                            ) : (
                                'Redefinir'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
