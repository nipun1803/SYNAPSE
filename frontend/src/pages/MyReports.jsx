import React, { useCallback, useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { reportService } from '../api/services';
import { toast } from 'react-toastify';
import {
  Upload, FileText, Trash2, Download, Filter,
  File, Image as ImageIcon, X, Plus, FolderOpen,
  ChevronDown, Search, Calendar, Tag
} from 'lucide-react';

const CATEGORIES = [
  { value: 'all', label: 'All Reports', icon: FolderOpen },
  { value: 'lab_report', label: 'Lab Reports', icon: FileText },
  { value: 'prescription', label: 'Prescriptions', icon: FileText },
  { value: 'imaging', label: 'Imaging / Scans', icon: ImageIcon },
  { value: 'discharge_summary', label: 'Discharge Summary', icon: File },
  { value: 'other', label: 'Other', icon: File },
];

const categoryColors = {
  lab_report: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  prescription: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  imaging: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  discharge_summary: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  other: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
};

function formatFileSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
}

const MyReports = () => {
  const { userData } = useContext(AppContext);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Upload form state
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadCategory, setUploadCategory] = useState('other');

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const data = await reportService.getMyReports({
        category: activeCategory !== 'all' ? activeCategory : undefined
      });
      if (data.success) {
        setReports(data.reports);
      }
    } catch (err) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      toast.error('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('report', uploadFile);
    formData.append('description', uploadDesc);
    formData.append('category', uploadCategory);

    try {
      setUploading(true);
      const data = await reportService.uploadReport(formData);
      if (data.success) {
        toast.success('Report uploaded successfully');
        setShowUploadModal(false);
        setUploadFile(null);
        setUploadDesc('');
        setUploadCategory('other');
        fetchReports();
      } else {
        toast.error(data.message || 'Upload failed');
      }
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const data = await reportService.deleteReport(id);
      if (data.success) {
        toast.success('Report deleted');
        setDeleteConfirm(null);
        fetchReports();
      } else {
        toast.error(data.message || 'Delete failed');
      }
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const filteredReports = reports.filter(r => {
    const matchesSearch = !searchTerm || 
      (r.fileName && r.fileName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.description && r.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    let matchesDate = true;
    if (dateFilter && r.createdAt) {
      try {
        const reportDate = new Date(r.createdAt).toISOString().split('T')[0];
        matchesDate = reportDate === dateFilter;
      } catch (e) {
        matchesDate = false;
      }
    } else if (dateFilter && !r.createdAt) {
      matchesDate = false;
    }

    return matchesSearch && matchesDate;
  });

  return (
    <div className='max-w-6xl mx-auto'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8'>
        <div>
          <h1 className='text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white'>
            My Medical Reports
          </h1>
          <p className='text-gray-500 dark:text-gray-400 mt-1'>
            Upload and manage your medical records securely
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className='flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40'
        >
          <Plus className='w-5 h-5' />
          Upload Report
        </button>
      </div>

      {/* Filters */}
      <div className='flex flex-col lg:flex-row gap-4 mb-6'>
        {/* Search */}
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
          <input
            type='text'
            placeholder='Search by filename or description...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
          />
        </div>

        {/* Date Filter */}
        <div className='relative w-full lg:w-48'>
          <Calendar className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
          <input
            type='date'
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className='w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
          />
        </div>

        {/* Reset */}
        {(searchTerm || dateFilter) && (
          <button 
            onClick={() => { setSearchTerm(''); setDateFilter(''); }}
            className='px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-sm font-medium transition-colors'
          >
            Reset Filters
          </button>
        )}

        {/* Category Filter */}
        <div className='flex gap-2 overflow-x-auto pb-1 scrollbar-hide lg:border-l lg:pl-4 border-gray-200 dark:border-gray-700'>
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat.value
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className='w-3.5 h-3.5' />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Reports Grid */}
      {loading ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className='bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 animate-pulse'>
              <div className='h-10 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4' />
              <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2' />
              <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2' />
            </div>
          ))}
        </div>
      ) : filteredReports.length === 0 ? (
        <div className='text-center py-16'>
          <div className='w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center'>
            <FolderOpen className='w-10 h-10 text-blue-500' />
          </div>
          <h3 className='text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1'>
            No reports found
          </h3>
          <p className='text-gray-400 mb-4'>
            {activeCategory !== 'all' ? 'No reports in this category.' : 'Upload your first medical report to get started.'}
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className='px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all'
          >
            Upload Report
          </button>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {filteredReports.map(report => (
            <div
              key={report._id}
              className='group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg transition-all duration-300 overflow-hidden'
            >
              {/* File Preview / Icon */}
              <div className='h-32 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-750 dark:to-gray-800 flex items-center justify-center relative'>
                {report.fileType === 'image' ? (
                  <img
                    src={report.fileUrl}
                    alt={report.fileName}
                    className='w-full h-full object-cover'
                    loading='lazy'
                  />
                ) : (
                  <div className='flex flex-col items-center gap-1'>
                    <FileText className='w-12 h-12 text-red-400' />
                    <span className='text-xs text-gray-400 uppercase font-mono'>
                      {report.fileType || 'PDF'}
                    </span>
                  </div>
                )}

                {/* Action buttons overlay */}
                <div className='absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                  <a
                    href={report.fileUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors'
                    title='Download'
                  >
                    <Download className='w-4 h-4 text-blue-600' />
                  </a>
                  <button
                    onClick={() => setDeleteConfirm(report._id)}
                    className='p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:bg-red-50 dark:hover:bg-gray-700 transition-colors'
                    title='Delete'
                  >
                    <Trash2 className='w-4 h-4 text-red-500' />
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className='p-4'>
                <h3 className='font-semibold text-gray-800 dark:text-white text-sm truncate mb-1.5' title={report.fileName}>
                  {report.fileName}
                </h3>
                {report.description && (
                  <p className='text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2'>
                    {report.description}
                  </p>
                )}
                <div className='flex items-center justify-between gap-2'>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColors[report.category] || categoryColors.other}`}>
                    {CATEGORIES.find(c => c.value === report.category)?.label || report.category || 'Other'}
                  </span>
                  <div className='flex items-center gap-2 text-xs text-gray-400'>
                    <span>{formatFileSize(report.fileSize)}</span>
                    <span>•</span>
                    <span>{report.createdAt ? formatDate(report.createdAt) : '—'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Debug view (only in dev) */}
      {import.meta.env.MODE === 'development' && reports.length > 0 && filteredReports.length === 0 && (
        <div className="mt-4 p-4 bg-yellow-50 text-yellow-800 text-xs rounded-lg border border-yellow-200">
          Debug: {reports.length} reports total, but 0 matches filters. (Search: "{searchTerm}", Date: "{dateFilter}")
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className='fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4'>
          <div className='bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl'>
            <h3 className='text-lg font-bold text-gray-900 dark:text-white mb-2'>Delete Report?</h3>
            <p className='text-gray-500 dark:text-gray-400 text-sm mb-6'>
              This action cannot be undone. The file will be permanently removed.
            </p>
            <div className='flex gap-3'>
              <button
                onClick={() => setDeleteConfirm(null)}
                className='flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors'
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className='flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors'
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className='fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4'>
          <div className='bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden'>
            {/* Modal Header */}
            <div className='flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700'>
              <h3 className='text-lg font-bold text-gray-900 dark:text-white'>Upload Medical Report</h3>
              <button
                onClick={() => { setShowUploadModal(false); setUploadFile(null); }}
                className='p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors'
              >
                <X className='w-5 h-5 text-gray-500' />
              </button>
            </div>

            <form onSubmit={handleUpload} className='p-5 space-y-5'>
              {/* File Drop Area */}
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  uploadFile
                    ? 'border-blue-400 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
                }`}
              >
                <input
                  type='file'
                  accept='.pdf,.jpg,.jpeg,.png,.webp'
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
                />
                {uploadFile ? (
                  <div className='flex flex-col items-center gap-2'>
                    <FileText className='w-10 h-10 text-blue-500' />
                    <p className='font-medium text-gray-800 dark:text-white'>{uploadFile.name}</p>
                    <p className='text-xs text-gray-400'>{formatFileSize(uploadFile.size)}</p>
                  </div>
                ) : (
                  <div className='flex flex-col items-center gap-2'>
                    <Upload className='w-10 h-10 text-gray-400' />
                    <p className='text-gray-600 dark:text-gray-300 font-medium'>
                      Click or drag to upload
                    </p>
                    <p className='text-xs text-gray-400'>PDF, JPG, PNG up to 10MB</p>
                  </div>
                )}
              </div>

              {/* Category */}
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5'>
                  Category
                </label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className='w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500'
                >
                  {CATEGORIES.filter(c => c.value !== 'all').map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5'>
                  Description (optional)
                </label>
                <textarea
                  value={uploadDesc}
                  onChange={(e) => setUploadDesc(e.target.value)}
                  placeholder='e.g., Blood test results from May 2026'
                  rows={2}
                  className='w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 resize-none'
                />
              </div>

              {/* Submit */}
              <button
                type='submit'
                disabled={uploading || !uploadFile}
                className='w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
              >
                {uploading ? (
                  <>
                    <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className='w-4 h-4' />
                    Upload Report
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyReports;
