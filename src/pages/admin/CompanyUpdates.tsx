import { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { Tag } from 'primereact/tag';
import { TabView, TabPanel } from 'primereact/tabview';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { ADMIN_ENDPOINTS } from '../../constants/api';
import { getAdminHeaders } from '../../utils/auth';
import { useNotification } from '../../contexts/NotificationContext';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import SEO from '../../components/SEO';
import styles from './CompanyUpdates.module.scss';

interface CompanyUpdate {
  id: number;
  company_id: number;
  requested_by_user_id: number;
  company_description: string | null;
  recruitment_page: string | null;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by_user_id: number | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  company_name: string;
  requester_name: string;
}

const CompanyUpdates = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [updates, setUpdates] = useState<Record<'pending' | 'approved' | 'rejected', CompanyUpdate[]>>({
    pending: [],
    approved: [],
    rejected: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState(0);
  const [rejectDialogVisible, setRejectDialogVisible] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState<CompanyUpdate | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchAllUpdates();
  }, []);

  const fetchAllUpdates = async () => {
    setLoading(true);
    setError('');

    try {
      const headers = getAdminHeaders();
      if (!headers) {
        setError(t('admin.errors.unauthorized'));
        return;
      }

      const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
        fetch(ADMIN_ENDPOINTS.COMPANY_UPDATES('pending'), { headers }),
        fetch(ADMIN_ENDPOINTS.COMPANY_UPDATES('approved'), { headers }),
        fetch(ADMIN_ENDPOINTS.COMPANY_UPDATES('rejected'), { headers }),
      ]);

      const pendingData = pendingRes.ok ? await pendingRes.json() : { data: [] };
      const approvedData = approvedRes.ok ? await approvedRes.json() : { data: [] };
      const rejectedData = rejectedRes.ok ? await rejectedRes.json() : { data: [] };

      setUpdates({
        pending: Array.isArray(pendingData.data) ? pendingData.data : [],
        approved: Array.isArray(approvedData.data) ? approvedData.data : [],
        rejected: Array.isArray(rejectedData.data) ? rejectedData.data : [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('admin.errors.loadFailed'));
      showNotification(t('admin.errors.loadFailed'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (update: CompanyUpdate) => {
    confirmDialog({
      message: t('admin.companyUpdates.confirmApprove', { company: update.company_name }),
      header: t('admin.companyUpdates.confirmApproveTitle'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => performApprove(update.id),
    });
  };

  const handleReject = (update: CompanyUpdate) => {
    setSelectedUpdate(update);
    setRejectionReason('');
    setRejectDialogVisible(true);
  };

  const performApprove = async (updateId: number) => {
    setActionLoading(true);
    try {
      const headers = getAdminHeaders();
      if (!headers) {
        showNotification(t('admin.errors.unauthorized'), 'error');
        return;
      }

      const response = await fetch(ADMIN_ENDPOINTS.APPROVE_UPDATE, {
        method: 'POST',
        headers,
        body: JSON.stringify({ update_id: updateId }),
      });

      if (!response.ok) {
        throw new Error(t('admin.errors.approveFailed'));
      }

      showNotification(t('admin.companyUpdates.updateApproved'), 'success');
      fetchAllUpdates();
    } catch (err) {
      showNotification(err instanceof Error ? err.message : t('admin.errors.approveFailed'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const performReject = async () => {
    if (!selectedUpdate) return;

    setActionLoading(true);
    try {
      const headers = getAdminHeaders();
      if (!headers) {
        showNotification(t('admin.errors.unauthorized'), 'error');
        return;
      }

      const response = await fetch(ADMIN_ENDPOINTS.REJECT_UPDATE, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          update_id: selectedUpdate.id,
          reason: rejectionReason || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(t('admin.errors.rejectFailed'));
      }

      showNotification(t('admin.companyUpdates.updateRejected'), 'success');
      setRejectDialogVisible(false);
      setSelectedUpdate(null);
      fetchAllUpdates();
    } catch (err) {
      showNotification(err instanceof Error ? err.message : t('admin.errors.rejectFailed'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const statusBodyTemplate = (rowData: CompanyUpdate) => {
    const severity =
      rowData.status === 'approved'
        ? 'success'
        : rowData.status === 'rejected'
        ? 'danger'
        : 'warning';
    return <Tag value={t(`admin.companyUpdates.statusValues.${rowData.status}`)} severity={severity} />;
  };

  const companyBodyTemplate = (rowData: CompanyUpdate) => {
    return (
      <div>
        <a
          href={`/companies/${rowData.company_id}`}
          onClick={(e) => {
            e.preventDefault();
            navigate(`/companies/${rowData.company_id}`);
          }}
          className={styles.companyLink}
        >
          {rowData.company_name}
        </a>
      </div>
    );
  };

  const descriptionBodyTemplate = (rowData: CompanyUpdate) => {
    if (!rowData.company_description) return <span className={styles.noData}>-</span>;
    return (
      <div className={styles.description}>
        {rowData.company_description.length > 100
          ? `${rowData.company_description.substring(0, 100)}...`
          : rowData.company_description}
      </div>
    );
  };

  const recruitmentBodyTemplate = (rowData: CompanyUpdate) => {
    if (!rowData.recruitment_page) return <span className={styles.noData}>-</span>;
    return (
      <a href={rowData.recruitment_page} target="_blank" rel="noopener noreferrer" className={styles.link}>
        {rowData.recruitment_page.length > 50
          ? `${rowData.recruitment_page.substring(0, 50)}...`
          : rowData.recruitment_page}
      </a>
    );
  };

  const actionsBodyTemplate = (rowData: CompanyUpdate) => {
    if (rowData.status !== 'pending') return null;

    return (
      <div className={styles.actions}>
        <Button
          icon="pi pi-check"
          label={t('admin.companyUpdates.approve')}
          onClick={() => handleApprove(rowData)}
          size="small"
          severity="success"
          loading={actionLoading}
          className={styles.actionButton}
        />
        <Button
          icon="pi pi-times"
          label={t('admin.companyUpdates.reject')}
          onClick={() => handleReject(rowData)}
          size="small"
          severity="danger"
          outlined
          loading={actionLoading}
          className={styles.actionButton}
        />
      </div>
    );
  };

  const dateBodyTemplate = (rowData: CompanyUpdate) => {
    return new Date(rowData.created_at).toLocaleString();
  };

  const renderTable = (status: 'pending' | 'approved' | 'rejected') => {
    const data = updates[status];
    return (
      <DataTable
        value={data}
        paginator
        rows={10}
        rowsPerPageOptions={[10, 25, 50]}
        emptyMessage={t('admin.companyUpdates.noUpdates')}
        className={styles.dataTable}
      >
        <Column field="id" header={t('admin.companyUpdates.id')} sortable style={{ width: '80px' }} />
        <Column
          header={t('admin.companyUpdates.company')}
          body={companyBodyTemplate}
          sortable
          sortField="company_name"
        />
        <Column
          header={t('admin.companyUpdates.requester')}
          field="requester_name"
          sortable
        />
        <Column
          header={t('admin.companyUpdates.description')}
          body={descriptionBodyTemplate}
          style={{ minWidth: '200px' }}
        />
        <Column
          header={t('admin.companyUpdates.recruitmentPage')}
          body={recruitmentBodyTemplate}
          style={{ minWidth: '200px' }}
        />
        <Column
          header={t('admin.companyUpdates.status')}
          body={statusBodyTemplate}
          style={{ width: '120px' }}
        />
        <Column
          header={t('admin.companyUpdates.createdAt')}
          body={dateBodyTemplate}
          sortable
          sortField="created_at"
          style={{ width: '180px' }}
        />
        <Column
          header={t('admin.companyUpdates.actions')}
          body={actionsBodyTemplate}
          style={{ minWidth: '200px' }}
        />
      </DataTable>
    );
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <>
      <SEO
        title={`${t('admin.navigation.companyUpdates')} - ${t('app.title')}`}
        description="Company updates management"
        url={currentUrl}
        noindex={true}
      />
      <ConfirmDialog />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>{t('admin.navigation.companyUpdates')}</h1>
          <Button
            icon="pi pi-refresh"
            label={t('common.refresh')}
            onClick={fetchAllUpdates}
            outlined
          />
        </div>

        {error && (
          <Message severity="error" text={error} className={styles.errorMessage} />
        )}

        {loading ? (
          <div className={styles.loading}>
            <ProgressSpinner />
            <p>{t('common.loading')}</p>
          </div>
        ) : (
          <Card>
            <TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}>
              <TabPanel header={t('admin.companyUpdates.pending')}>
                {renderTable('pending')}
              </TabPanel>
              <TabPanel header={t('admin.companyUpdates.approved')}>
                {renderTable('approved')}
              </TabPanel>
              <TabPanel header={t('admin.companyUpdates.rejected')}>
                {renderTable('rejected')}
              </TabPanel>
            </TabView>
          </Card>
        )}

        <Dialog
          visible={rejectDialogVisible}
          onHide={() => setRejectDialogVisible(false)}
          header={t('admin.companyUpdates.rejectTitle')}
          modal
          style={{ width: '90vw', maxWidth: '500px' }}
        >
          <div className={styles.rejectDialog}>
            <p>{t('admin.companyUpdates.rejectMessage', { company: selectedUpdate?.company_name })}</p>
            <div className={styles.formField}>
              <label>{t('admin.companyUpdates.rejectionReason')} ({t('common.optional')})</label>
              <InputTextarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                placeholder={t('admin.companyUpdates.rejectionReasonPlaceholder')}
                className={styles.textarea}
              />
            </div>
            <div className={styles.dialogActions}>
              <Button
                label={t('common.cancel')}
                onClick={() => setRejectDialogVisible(false)}
                severity="secondary"
                outlined
              />
              <Button
                label={t('admin.companyUpdates.reject')}
                onClick={performReject}
                loading={actionLoading}
                severity="danger"
              />
            </div>
          </div>
        </Dialog>
      </div>
    </>
  );
};

export default CompanyUpdates;


