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
import { mockClasses, mockMaterials } from '@/data/mockData';
import { LearningMaterial } from '@/types';
import { Upload, FileText, Download, Eye, Calendar, User, Plus, BookOpen, X } from 'lucide-react';
import { toast } from 'sonner';

export default function Materials() {
  const [materials, setMaterials] = useState<LearningMaterial[]>(mockMaterials);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewMaterial, setPreviewMaterial] = useState<LearningMaterial | null>(null);
  const [newMaterial, setNewMaterial] = useState({
    title: '',
    description: '',
    classId: '',
    week: ''
  });

  const filteredMaterials = selectedClass === 'all' 
    ? materials 
    : materials.filter(m => m.classId === selectedClass);

  const handleUpload = () => {
    if (!newMaterial.title || !newMaterial.classId) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    const material: LearningMaterial = {
      id: String(materials.length + 1),
      classId: newMaterial.classId,
      title: newMaterial.title,
      description: newMaterial.description,
      fileUrl: '/materials/new-file.pdf',
      fileType: 'pdf',
      week: newMaterial.week ? parseInt(newMaterial.week) : undefined,
      uploadedBy: 'Admin',
      uploadedAt: new Date().toISOString()
    };

    setMaterials([material, ...materials]);
    setNewMaterial({ title: '', description: '', classId: '', week: '' });
    setIsDialogOpen(false);
    toast.success('Upload tài liệu thành công!');
  };

  const handleView = (material: LearningMaterial) => {
    setPreviewMaterial(material);
    setIsPreviewOpen(true);
  };

  const handleDownload = (material: LearningMaterial) => {
    toast.info('Cần kết nối Storage để tải xuống tài liệu. Vui lòng kết nối Lovable Cloud.', {
      duration: 4000
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getClassName = (classId: string) => {
    return mockClasses.find(c => c.id === classId)?.name || 'Không xác định';
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
                {mockClasses.map(cls => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-muted-foreground">
              {filteredMaterials.length} tài liệu
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
                    value={newMaterial.title}
                    onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="classId">Lớp *</Label>
                    <Select
                      value={newMaterial.classId}
                      onValueChange={(value) => setNewMaterial({ ...newMaterial, classId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn lớp" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockClasses.map(cls => (
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
                      value={newMaterial.week}
                      onChange={(e) => setNewMaterial({ ...newMaterial, week: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Mô tả</Label>
                  <Textarea
                    id="description"
                    placeholder="Mô tả nội dung tài liệu..."
                    value={newMaterial.description}
                    onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
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

        {/* Materials Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredMaterials.map((material, index) => (
            <Card 
              key={material.id} 
              variant="interactive"
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
                    <FileText className="h-6 w-6 text-destructive" />
                  </div>
                  {material.week && (
                    <Badge variant="secondary">Tuần {material.week}</Badge>
                  )}
                </div>
                <CardTitle className="text-lg mt-3 line-clamp-2">{material.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {material.description || 'Không có mô tả'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    <span>{getClassName(material.classId)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>{material.uploadedBy}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(material.uploadedAt)}</span>
                  </div>
                  
                  <div className="flex gap-2 pt-3 border-t">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleView(material)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Xem
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleDownload(material)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Tải xuống
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredMaterials.length === 0 && (
          <Card variant="flat" className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Chưa có tài liệu</h3>
              <p className="text-muted-foreground text-center mb-4">
                Bắt đầu bằng việc upload tài liệu giáo án đầu tiên
              </p>
              <Button variant="gold" onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Upload tài liệu
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Preview Dialog */}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-destructive" />
                {previewMaterial?.title}
              </DialogTitle>
              <DialogDescription>
                {previewMaterial?.description || 'Không có mô tả'}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="rounded-lg border bg-muted/50 p-8 text-center min-h-[300px] flex flex-col items-center justify-center">
                <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">
                  Xem trước tài liệu PDF
                </p>
                <p className="text-sm text-muted-foreground">
                  Cần kết nối Lovable Cloud Storage để hiển thị nội dung file
                </p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  <span>Lớp: {previewMaterial ? getClassName(previewMaterial.classId) : ''}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>Upload bởi: {previewMaterial?.uploadedBy}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Ngày: {previewMaterial ? formatDate(previewMaterial.uploadedAt) : ''}</span>
                </div>
                {previewMaterial?.week && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Badge variant="secondary">Tuần {previewMaterial.week}</Badge>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
                Đóng
              </Button>
              <Button onClick={() => previewMaterial && handleDownload(previewMaterial)}>
                <Download className="mr-2 h-4 w-4" />
                Tải xuống
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
