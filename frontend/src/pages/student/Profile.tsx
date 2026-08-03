import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Phone, Mail, Camera, Save, GraduationCap, MapPin, Phone as PhoneIcon } from 'lucide-react';
import API from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { getInitials, formatDate } from '../../lib/utils';
import toast from 'react-hot-toast';

const fetchProfile = () => API.get('/students/me').then(r => r.data.data);

const schema = z.object({
  phone: z.string().optional(),
  course: z.string().optional(),
  college: z.string().optional(),
  year: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function StudentProfile() {
  const { user, updateUser } = useAuth();
  const qc = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const { data: student, isLoading } = useQuery({ queryKey: ['my-profile'], queryFn: fetchProfile });

  const { register, handleSubmit, formState: { isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: {
      phone: user?.phone || '',
      course: student?.course || '',
      college: student?.college || '',
      year: student?.year?.toString() || '',
    },
  });

  const updateProfile = useMutation({
    mutationFn: (d: any) => API.put('/students/me', d),
    onSuccess: (res) => { qc.invalidateQueries({ queryKey: ['my-profile'] }); toast.success('Profile updated!'); },
    onError: () => toast.error('Failed to update.'),
  });

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('avatar', file);
      const res = await API.post('/auth/upload-avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      updateUser({ avatar: res.data.data.avatar });
      toast.success('Avatar updated!');
    } catch {
      toast.error('Failed to upload avatar.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-heading">My Profile</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your personal information</p>
      </div>

      {/* Avatar */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl gradient-bg flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
              {user?.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" /> : getInitials(user?.name || '')}
            </div>
            <label className={`absolute -bottom-2 -right-2 w-8 h-8 bg-white dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 flex items-center justify-center cursor-pointer shadow-md hover:bg-slate-50 transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
              <Camera size={14} className="text-slate-600 dark:text-slate-400" />
              <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
            </label>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white font-heading">{user?.name}</h2>
            <p className="text-slate-500">{user?.email}</p>
            {student?.rollNumber && <p className="text-sm text-indigo-600 font-medium mt-1">Roll No: {student.rollNumber}</p>}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">Active Student</span>
              {student?.roomId && <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-medium">Room {student.roomId.roomNumber}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Info cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 md:gap-6">{Array(4).fill(0).map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          {[
            { icon: GraduationCap, label: 'Course', value: student?.course || 'Not set', sub: student?.year ? `Year ${student.year}` : '' },
            { icon: MapPin, label: 'College', value: student?.college || 'Not set', sub: '' },
            { icon: PhoneIcon, label: 'Phone', value: user?.phone || 'Not set', sub: '' },
            { icon: User, label: 'Blood Group', value: student?.bloodGroup || 'Not set', sub: student?.gender || '' },
          ].map((info, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                <info.icon size={18} className="text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">{info.label}</p>
                <p className="font-medium text-slate-900 dark:text-white text-sm">{info.value}</p>
                {info.sub && <p className="text-xs text-slate-400">{info.sub}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit form */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6">
        <h3 className="font-semibold text-slate-900 dark:text-white font-heading mb-4">Edit Information</h3>
        <form onSubmit={handleSubmit(d => updateProfile.mutate(d))} className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Phone Number</label>
              <input {...register('phone')} type="tel" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Year of Study</label>
              <select {...register('year')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select year</option>
                {[1,2,3,4,5].map(y => <option key={y} value={y}>Year {y}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Course</label>
              <input {...register('course')} placeholder="B.Tech Computer Science" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">College Name</label>
              <input {...register('college')} placeholder="National Engineering College" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <button type="submit" disabled={isSubmitting} className="gradient-bg text-white px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:opacity-90 disabled:opacity-60">
            <Save size={16} /> {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
