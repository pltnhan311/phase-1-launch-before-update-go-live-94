import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, Download, Eye, FileText, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';

interface LearningMaterial {
  id: string;
  title: string;
  description: string | null;
  file_url: string | null;
  file_type: string;
  week: number | null;
  created_at: string;
}

export default function StudentMaterials() {
  const { user } = useAuth();
  const [previewMaterial, setPreviewMaterial] = useState<LearningMaterial | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  // Get student's class_id
  const { data: student } = useQuery({
    queryKey: ['student-class', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('class_id')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Get materials for the class
  const { data: materials, isLoading } = useQuery({
    queryKey: ['student-materials', student?.class_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learning_materials')
        .select('*')
        .eq('class_id', student?.class_id)
        .order('week', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as LearningMaterial[];
    },
    enabled: !!student?.class_id,
  });

  // Fetch PDF as blob for preview
  useEffect(() => {
    if (previewMaterial?.file_url) {
      setPdfLoading(true);
      setPdfBlobUrl(null);
      
      fetch(previewMaterial.file_url)
        .then(res => res.blob())
        .then(blob => {
          const url = URL.createObjectURL(blob);
          setPdfBlobUrl(url);
        })
        .catch(err => {
          console.error('Error loading PDF:', err);
          toast.error('Không thể tải PDF để xem trước');
        })
        .finally(() => setPdfLoading(false));
    } else {
      setPdfBlobUrl(null);
    }
    
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [previewMaterial?.file_url]);

  if (!student?.class_id) {
    return (
      <MainLayout title="Tài liệu" subtitle="Tài liệu học tập">
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Chưa có lớp học</h3>
            <p className="text-muted-foreground">
              Bạn chưa được phân vào lớp học nào.
            </p>
          </CardContent>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Tài liệu" subtitle="Tài liệu học tập của lớp">
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : materials && materials.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {materials.map((material) => (
              <Card key={material.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <CardTitle className="text-base line-clamp-1">{material.title}</CardTitle>
                    </div>
                    {material.week && (
                      <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full">
                        Tuần {material.week}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {material.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {material.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mb-3">
                    {format(new Date(material.created_at), 'dd/MM/yyyy', { locale: vi })}
                  </p>
                  <div className="flex gap-2">
                    {material.file_url && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => setPreviewMaterial(material)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Xem
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          asChild
                        >
                          <a href={material.file_url} download target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4 mr-1" />
                            Tải
                          </a>
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Chưa có tài liệu</h3>
              <p className="text-muted-foreground">
                Lớp của bạn chưa có tài liệu học tập nào.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewMaterial} onOpenChange={() => setPreviewMaterial(null)}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0">
          <DialogHeader className="p-4 pb-2">
            <DialogTitle>{previewMaterial?.title}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden bg-muted relative">
            {pdfLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Đang tải PDF...</p>
                </div>
              </div>
            ) : pdfBlobUrl ? (
              <iframe
                src={pdfBlobUrl}
                className="w-full h-full border-0"
                title={previewMaterial?.title || 'PDF Preview'}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Không thể tải PDF</p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
