import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useClasses } from '@/hooks/useClasses';
import { Upload, FileText, Download, Eye, Calendar, User, Plus, BookOpen, Loader2, Database } from 'lucide-react';
import { toast } from 'sonner';

export default function Materials() {
  const { data: classes, isLoading } = useClasses();
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Since we don't have materials in db yet, show empty state
  const materials: any[] = [];

  const handleUpload = () => {
    toast.info('Cần kết nối Storage để upload tài liệu. Vui lòng liên hệ admin.', {
      duration: 4000
    });
    setIsDialogOpen(false);
  };

  const handleView = () => {
    toast.info('Cần kết nối Storage để xem tài liệu.');
  };

  const handleDownload = () => {
    toast.info('Cần kết nối Storage để tải xuống tài liệu.', {
      duration: 4000
    });
  };

  return (
    <MainLayout 
      title="Tài liệu Giáo án" 
      subtitle="Upload và quản lý tài liệu học tập"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Chọn lớp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả lớp</SelectItem>
                {(classes || []).map(cls => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-muted-foreground">
              {materials.length} tài liệu
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="gold">
                <Upload className="mr-2 h-4 w-4" />
                Upload tài liệu
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Upload tài liệu mới</DialogTitle>
                <DialogDescription>
                  Upload file PDF giáo án cho lớp học.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Tiêu đề *</Label>
                  <Input
                    id="title"
                    placeholder="VD: Bài 4: Mười Điều Răn"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="classId">Lớp *</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn lớp" />
                      </SelectTrigger>
                      <SelectContent>
                        {(classes || []).map(cls => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="week">Tuần</Label>
                    <Input
                      id="week"
                      type="number"
                      min="1"
                      placeholder="VD: 4"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Mô tả</Label>
                  <Textarea
                    id="description"
                    placeholder="Mô tả nội dung tài liệu..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>File PDF</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Kéo thả file PDF vào đây hoặc click để chọn
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Chỉ hỗ trợ file PDF, tối đa 10MB
                    </p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={handleUpload}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Empty State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Card variant="flat" className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Chưa có tài liệu</h3>
              <p className="text-muted-foreground text-center mb-4">
                Cần kết nối Storage để upload và quản lý tài liệu
              </p>
              <Button variant="gold" onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Upload tài liệu
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
