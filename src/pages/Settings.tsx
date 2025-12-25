import React, { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ImageCropModal } from '@/components/ImageCropModal';
import { useToast } from '@/hooks/use-toast';
import { Camera, Loader2, User, Save } from 'lucide-react';

export default function Settings() {
    const { user, profile, isManager } = useAuth();
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [fullName, setFullName] = useState(profile?.full_name || '');
    const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
    const [cropModalOpen, setCropModalOpen] = useState(false);
    const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getAvatarUrl = (path: string | null) => {
        if (!path) return null;
        // Se já for uma URL completa, retorna ela mesma
        if (path.startsWith('http')) return path;
        // Caso contrário, constrói a URL do Supabase Storage
        const { data } = supabase.storage.from('avatars').getPublicUrl(path);
        return data.publicUrl;
    };

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user) return;

        // Validar tipo de arquivo
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            toast({
                title: 'Erro',
                description: 'Tipo de arquivo não permitido. Use JPEG, PNG, GIF ou WebP.',
                variant: 'destructive',
            });
            return;
        }

        // Validar tamanho (5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: 'Erro',
                description: 'O arquivo deve ter no máximo 5MB.',
                variant: 'destructive',
            });
            return;
        }

        // Criar URL temporária para a imagem e abrir modal de crop
        const imageUrl = URL.createObjectURL(file);
        setSelectedImageSrc(imageUrl);
        setCropModalOpen(true);

        // Limpar o input para permitir selecionar o mesmo arquivo novamente
        event.target.value = '';
    };

    const handleCropComplete = async (croppedBlob: Blob) => {
        if (!user) return;

        setUploading(true);
        setCropModalOpen(false);

        try {
            // Criar nome único para o arquivo
            const fileName = `${user.id}/${Date.now()}.jpg`;

            // Upload do arquivo cropado
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, croppedBlob, {
                    upsert: true,
                    contentType: 'image/jpeg',
                });

            if (uploadError) throw uploadError;

            // Atualizar o perfil com a nova URL
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: fileName })
                .eq('id', user.id);

            if (updateError) throw updateError;

            setAvatarUrl(fileName);

            toast({
                title: 'Sucesso!',
                description: 'Foto de perfil atualizada.',
            });

            // Recarregar a página para atualizar o contexto
            window.location.reload();
        } catch (error) {
            console.error('Error uploading avatar:', error);
            toast({
                title: 'Erro',
                description: 'Não foi possível fazer upload da imagem.',
                variant: 'destructive',
            });
        } finally {
            setUploading(false);
            // Limpar a URL da imagem selecionada
            if (selectedImageSrc) {
                URL.revokeObjectURL(selectedImageSrc);
                setSelectedImageSrc(null);
            }
        }
    };

    const handleCropModalClose = () => {
        setCropModalOpen(false);
        if (selectedImageSrc) {
            URL.revokeObjectURL(selectedImageSrc);
            setSelectedImageSrc(null);
        }
    };

    const handleSaveProfile = async () => {
        if (!user) return;

        setSaving(true);

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ full_name: fullName })
                .eq('id', user.id);

            if (error) throw error;

            toast({
                title: 'Sucesso!',
                description: 'Perfil atualizado com sucesso.',
            });

            // Recarregar para atualizar o contexto
            window.location.reload();
        } catch (error) {
            console.error('Error updating profile:', error);
            toast({
                title: 'Erro',
                description: 'Não foi possível atualizar o perfil.',
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="container max-w-2xl py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
                <p className="text-muted-foreground mt-1">
                    Gerencie suas configurações de perfil
                </p>
            </div>

            <div className="space-y-6">
                {/* Card de Foto de Perfil */}
                <Card>
                    <CardHeader>
                        <CardTitle>Foto de Perfil</CardTitle>
                        <CardDescription>
                            Clique na imagem para alterar sua foto de perfil
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-6">
                            <div className="relative group">
                                <Avatar className="h-24 w-24 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    <AvatarImage src={getAvatarUrl(avatarUrl) || undefined} alt={profile?.full_name} />
                                    <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                                        {profile?.full_name ? getInitials(profile.full_name) : <User className="h-10 w-10" />}
                                    </AvatarFallback>
                                </Avatar>
                                <div
                                    className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {uploading ? (
                                        <Loader2 className="h-8 w-8 text-white animate-spin" />
                                    ) : (
                                        <Camera className="h-8 w-8 text-white" />
                                    )}
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/gif,image/webp"
                                    className="hidden"
                                    onChange={handleFileSelect}
                                    disabled={uploading}
                                />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-foreground">{profile?.full_name}</p>
                                <p className="text-sm text-muted-foreground">{profile?.email}</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {isManager ? 'Gestor' : `Colaborador - ${profile?.department}`}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Card de Informações Pessoais */}
                <Card>
                    <CardHeader>
                        <CardTitle>Informações Pessoais</CardTitle>
                        <CardDescription>
                            Atualize suas informações pessoais
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Nome Completo</Label>
                            <Input
                                id="fullName"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Seu nome completo"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                value={profile?.email || ''}
                                disabled
                                className="bg-muted"
                            />
                            <p className="text-xs text-muted-foreground">
                                O email não pode ser alterado
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role">Função</Label>
                            <Input
                                id="role"
                                value={isManager ? 'Gestor' : 'Colaborador'}
                                disabled
                                className="bg-muted"
                            />
                        </div>

                        {!isManager && (
                            <div className="space-y-2">
                                <Label htmlFor="department">Setor</Label>
                                <Input
                                    id="department"
                                    value={profile?.department || ''}
                                    disabled
                                    className="bg-muted"
                                />
                                <p className="text-xs text-muted-foreground">
                                    O setor é definido pelo administrador
                                </p>
                            </div>
                        )}

                        <Button onClick={handleSaveProfile} disabled={saving} className="w-full">
                            {saving ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Salvar Alterações
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Modal de Crop de Imagem */}
            {selectedImageSrc && (
                <ImageCropModal
                    open={cropModalOpen}
                    onClose={handleCropModalClose}
                    imageSrc={selectedImageSrc}
                    onCropComplete={handleCropComplete}
                />
            )}
        </div>
    );
}
