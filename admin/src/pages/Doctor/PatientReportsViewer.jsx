import React, { useEffect, useState } from 'react';
import { doctorService } from '../../api/doctorService';
import { toast } from 'react-toastify';
import { FileText, Download, X, FolderOpen, Image as ImageIcon, File, ExternalLink } from 'lucide-react';

const categoryLabels = {
  lab_report: 'Lab Report',
  prescription: 'Prescription',
  imaging: 'Imaging',
  discharge_summary: 'Discharge Summary',
  other: 'Other',
};

const categoryColors = {
  lab_report: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  prescription: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  imaging: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  discharge_summary: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  other: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
};

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
}

function formatFileSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

const PatientReportsViewer = ({ userId, patientName, onClose }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const { data } = await doctorService.getPatientReports(userId);
        if (data.success) {
          setReports(data.reports);
        }
      } catch (err) {
        toast.error('Failed to load patient reports');
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchReports();
  }, [userId]);

  return (
    <div className='fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4'>
      <div className='bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden shadow-2xl'>
        {/* Header */}
        <div className='flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700'>
          <div>
            <h3 className='text-lg font-bold text-gray-900 dark:text-white'>
              Patient Reports
            </h3>
            <p className='text-sm text-gray-500 dark:text-gray-400'>
              {patientName || 'Patient'}'s uploaded medical records
            </p>
          </div>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors'
          >
            <X className='w-5 h-5 text-gray-500' />
          </button>
        </div>

        {/* Content */}
        <div className='overflow-y-auto p-5' style={{ maxHeight: 'calc(80vh - 80px)' }}>
          {loading ? (
            <div className='space-y-3'>
              {[1, 2, 3].map(i => (
                <div key={i} className='h-20 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse' />
              ))}
            </div>
          ) : reports.length === 0 ? (
            <div className='text-center py-12'>
              <FolderOpen className='w-12 h-12 text-gray-300 mx-auto mb-3' />
              <p className='text-gray-500 dark:text-gray-400 font-medium'>No reports uploaded</p>
              <p className='text-sm text-gray-400 mt-1'>This patient hasn't uploaded any medical records yet.</p>
            </div>
          ) : (
            <div className='space-y-3'>
              {reports.map(report => (
                <div
                  key={report._id}
                  className='flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-750 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-700 transition-colors'
                >
                  {/* File icon */}
                  <div className='flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 flex items-center justify-center'>
                    {report.fileType === 'image' ? (
                      <ImageIcon className='w-6 h-6 text-blue-600 dark:text-blue-400' />
                    ) : report.fileType === 'pdf' ? (
                      <FileText className='w-6 h-6 text-red-500' />
                    ) : (
                      <File className='w-6 h-6 text-gray-500' />
                    )}
                  </div>

                  {/* Info */}
                  <div className='flex-1 min-w-0'>
                    <h4 className='text-sm font-semibold text-gray-800 dark:text-white truncate'>
                      {report.fileName}
                    </h4>
                    <div className='flex items-center gap-2 mt-1'>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColors[report.category] || categoryColors.other}`}>
                        {categoryLabels[report.category] || 'Other'}
                      </span>
                      <span className='text-xs text-gray-400'>{formatFileSize(report.fileSize)}</span>
                      <span className='text-xs text-gray-400'>•</span>
                      <span className='text-xs text-gray-400'>{formatDate(report.createdAt)}</span>
                    </div>
                    {report.description && (
                      <p className='text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1'>
                        {report.description}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <a
                    href={report.fileUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='flex-shrink-0 p-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800/40 transition-colors'
                    title='View / Download'
                  >
                    <ExternalLink className='w-4 h-4' />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientReportsViewer;
