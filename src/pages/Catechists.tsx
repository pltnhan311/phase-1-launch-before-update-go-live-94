import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { mockUsers, mockClasses } from '@/data/mockData';
import { User } from '@/types';
import { Plus, Search, Eye, Pencil, Trash2, Phone, Mail, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';

export default function Catechists() {
  const [catechists, setCatechists] = useState<User[]>(
    mockUsers.filter(u => u.role === 'glv')
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCatechist, setSelectedCatechist] = useState<User | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [newCatechist, setNewCatechist] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const filteredCatechists = catechists.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getAssignedClasses = (catechistId: string) => {
    return mockClasses.filter(cls => 
      cls.catechists.some(c => c.id === catechistId)
    );
  };

  const handleCreateCatechist = () => {
    if (!newCatechist.name || !newCatechist.email) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    const catechist: User = {
      id: String(Date.now()),
      name: newCatechist.name,
      email: newCatechist.email,
      phone: newCatechist.phone,
      role: 'glv'
    };

    setCatechists([...catechists, catechist]);
    setNewCatechist({ name: '', email: '', phone: '' });
    setIsDialogOpen(false);
    toast.success('Thêm Giáo lý viên thành công!');
  };

  const handleDelete = (id: string) => {
    setCatechists(catechists.filter(c => c.id !== id));
    toast.success('Đã xóa Giáo lý viên');
  };

  return (
    <MainLayout 
      title="Quản lý Giáo lý viên" 
      subtitle="Danh sách và thông tin GLV"
    >
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card variant="elevated">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                <GraduationCap className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tổng GLV</p>
                <p className="text-2xl font-bold">{catechists.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card variant="elevated">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                <GraduationCap className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Đang phụ trách lớp</p>
                <p className="text-2xl font-bold">
                  {catechists.filter(c => getAssignedClasses(c.id).length > 0).length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card variant="elevated">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Chưa phân lớp</p>
                <p className="text-2xl font-bold">
                  {catechists.filter(c => getAssignedClasses(c.id).length === 0).length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card variant="flat" className="border">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Tìm theo tên hoặc email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="gold">
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm GLV
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Thêm Giáo lý viên mới</DialogTitle>
                    <DialogDescription>
                      Điền thông tin để thêm GLV vào hệ thống.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="catName">Họ và tên *</Label>
                      <Input
                        id="catName"
                        placeholder="Nguyễn Văn A"
                        value={newCatechist.name}
                        onChange={(e) => setNewCatechist({ ...newCatechist, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="catEmail">Email *</Label>
                      <Input
                        id="catEmail"
                        type="email"
                        placeholder="email@example.com"
                        value={newCatechist.email}
                        onChange={(e) => setNewCatechist({ ...newCatechist, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="catPhone">Số điện thoại</Label>
                      <Input
                        id="catPhone"
                        placeholder="0901234567"
                        value={newCatechist.phone}
                        onChange={(e) => setNewCatechist({ ...newCatechist, phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Hủy
                    </Button>
                    <Button onClick={handleCreateCatechist}>
                      Thêm GLV
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Results count */}
        <p className="text-sm text-muted-foreground">
          Tìm thấy {filteredCatechists.length} Giáo lý viên
        </p>

        {/* Catechists Table */}
        <Card variant="elevated">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Họ và tên</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Số điện thoại</TableHead>
                  <TableHead>Lớp phụ trách</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCatechists.map((catechist, index) => {
                  const assignedClasses = getAssignedClasses(catechist.id);
                  return (
                    <TableRow 
                      key={catechist.id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <TableCell className="font-medium">{catechist.name}</TableCell>
                      <TableCell>{catechist.email}</TableCell>
                      <TableCell>{catechist.phone || '-'}</TableCell>
                      <TableCell>
                        {assignedClasses.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {assignedClasses.map(cls => (
                              <Badge key={cls.id} variant="secondary">
                                {cls.name}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <Badge variant="outline">Chưa phân lớp</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              setSelectedCatechist(catechist);
                              setIsDetailOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(catechist.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Catechist Detail Dialog */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="sm:max-w-[500px]">
            {selectedCatechist && (
              <>
                <DialogHeader>
                  <DialogTitle>Thông tin Giáo lý viên</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  {/* Avatar & Name */}
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-2xl font-bold text-accent">
                      {selectedCatechist.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{selectedCatechist.name}</h3>
                      <Badge variant="gold">Giáo lý viên</Badge>
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid gap-4">
                    <div className="flex items-center gap-3 rounded-lg border p-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{selectedCatechist.email}</p>
                      </div>
                    </div>
                    {selectedCatechist.phone && (
                      <div className="flex items-center gap-3 rounded-lg border p-3">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Số điện thoại</p>
                          <p className="font-medium">{selectedCatechist.phone}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3 rounded-lg border p-3">
                      <GraduationCap className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Lớp phụ trách</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {getAssignedClasses(selectedCatechist.id).length > 0 ? (
                            getAssignedClasses(selectedCatechist.id).map(cls => (
                              <Badge key={cls.id} variant="secondary">
                                {cls.name}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground">Chưa phân lớp</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
