"use client";

import { useState, useTransition } from "react";
import { Plus, Search, Edit2, Trash2, Download, Upload, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "react-toastify";
import {
    addStudentToRegistry,
    updateStudentInRegistry,
    deleteStudentFromRegistry,
    bulkImportToRegistry
} from "@/actions/student-registry";
import { StudentRegistry } from "@/lib/types";

interface StudentRegistryUIProps {
    initialStudents: StudentRegistry[];
}

export function StudentRegistryUI({ initialStudents }: StudentRegistryUIProps) {
    const [students, setStudents] = useState<StudentRegistry[]>(initialStudents);
    const [searchQuery, setSearchQuery] = useState("");
    const [isPending, startTransition] = useTransition();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<StudentRegistry | null>(null);

    // Filtered students
    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.uid.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const uid = formData.get("uid") as string;
        const name = formData.get("name") as string;

        startTransition(async () => {
            try {
                await addStudentToRegistry({ uid, name });
                toast.success("Student added to registry");
                setIsAddOpen(false);
                // Refresh local state (simplistic approach for now)
                window.location.reload();
            } catch (error) {
                toast.error("Failed to add student");
            }
        });
    };

    const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingStudent) return;

        const formData = new FormData(e.currentTarget);
        const uid = formData.get("uid") as string;
        const name = formData.get("name") as string;

        startTransition(async () => {
            try {
                await updateStudentInRegistry(editingStudent.id, { uid, name });
                toast.success("Student updated");
                setIsEditOpen(false);
                window.location.reload();
            } catch (error) {
                toast.error("Failed to update student");
            }
        });
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this student from the registry?")) return;

        startTransition(async () => {
            try {
                await deleteStudentFromRegistry(id);
                toast.success("Student deleted");
                window.location.reload();
            } catch (error) {
                toast.error("Failed to delete student");
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 group-focus-within:text-purple-400 transition-colors" />
                    <Input
                        placeholder="Search by UID or Name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-white/5 border-white/10 rounded-2xl focus:border-purple-500 transition-all"
                    />
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-2xl gap-2 font-medium">
                                <Plus className="h-4 w-4" />
                                Add Student
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-slate-900 border-white/10 text-white rounded-3xl">
                            <DialogHeader>
                                <DialogTitle>Add New Student to Registry</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleAdd} className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <label className="text-xs uppercase text-white/40 font-bold ml-1">UID (e.g., HQ0001)</label>
                                    <Input name="uid" required placeholder="HQ0001" className="bg-white/5 border-white/10 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs uppercase text-white/40 font-bold ml-1">Full Name</label>
                                    <Input name="name" required placeholder="MUHAMMAD ADIL" className="bg-white/5 border-white/10 rounded-xl" />
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)} className="rounded-xl">Cancel</Button>
                                    <Button type="submit" disabled={isPending} className="bg-purple-600 hover:bg-purple-700 rounded-xl">
                                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Student"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card className="bg-white/5 border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5">
                                <th className="p-4 text-xs uppercase text-white/40 font-bold tracking-wider">UID</th>
                                <th className="p-4 text-xs uppercase text-white/40 font-bold tracking-wider">Name</th>
                                <th className="p-4 text-xs uppercase text-white/40 font-bold tracking-wider">Created At</th>
                                <th className="p-4 text-xs uppercase text-white/40 font-bold tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredStudents.length > 0 ? (
                                filteredStudents.map((student) => (
                                    <tr key={student.id} className="hover:bg-white/2 transition-colors group">
                                        <td className="p-4 font-mono text-purple-400 font-medium">{student.uid}</td>
                                        <td className="p-4 text-white font-medium">{student.name}</td>
                                        <td className="p-4 text-white/40 text-sm">{new Date(student.createdAt).toLocaleDateString()}</td>
                                        <td className="p-4 text-right space-x-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    setEditingStudent(student);
                                                    setIsEditOpen(true);
                                                }}
                                                className="h-8 w-8 rounded-xl hover:bg-white/10 text-white/60 hover:text-white"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(student.id)}
                                                className="h-8 w-8 rounded-xl hover:bg-red-500/20 text-white/60 hover:text-red-400"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="p-12 text-center text-white/40">
                                        <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                        <p>No students found in registry</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Edit Modal */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="bg-slate-900 border-white/10 text-white rounded-3xl">
                    <DialogHeader>
                        <DialogTitle>Edit Registry Entry</DialogTitle>
                    </DialogHeader>
                    {editingStudent && (
                        <form onSubmit={handleEdit} className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <label className="text-xs uppercase text-white/40 font-bold ml-1">UID</label>
                                <Input name="uid" defaultValue={editingStudent.uid} required className="bg-white/5 border-white/10 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs uppercase text-white/40 font-bold ml-1">Full Name</label>
                                <Input name="name" defaultValue={editingStudent.name} required className="bg-white/5 border-white/10 rounded-xl" />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="ghost" onClick={() => setIsEditOpen(false)} className="rounded-xl">Cancel</Button>
                                <Button type="submit" disabled={isPending} className="bg-purple-600 hover:bg-purple-700 rounded-xl">
                                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
