import { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { ADMIN_ENDPOINTS } from '../../constants/api';
import { getAdminHeaders } from '../../utils/auth';
import { useNotification } from '../../contexts/NotificationContext';
import { useTranslation } from 'react-i18next';
import SEO from '../../components/SEO';
import styles from './UsersManagement.module.scss';

interface Role {
  user_id: number;
  role_id: number;
  role_name: string;
  assigned_at: string;
}

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  roles: Role[];
}

const UsersManagement = () => {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [assignDialogVisible, setAssignDialogVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [assignLoading, setAssignLoading] = useState(false);

  const roles = [
    { label: t('admin.users.roleValues.user'), value: 'user' },
    { label: t('admin.users.roleValues.editor'), value: 'editor' },
    { label: t('admin.users.roleValues.admin'), value: 'admin' },
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');

    try {
      const headers = getAdminHeaders();
      if (!headers) {
        setError(t('admin.errors.unauthorized'));
        return;
      }

      const response = await fetch(ADMIN_ENDPOINTS.USERS, { headers });

      if (!response.ok) {
        throw new Error(t('admin.errors.loadFailed'));
      }

      const data = await response.json();
      setUsers(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('admin.errors.loadFailed'));
      showNotification(t('admin.errors.loadFailed'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRole = (user: User) => {
    setSelectedUser(user);
    setSelectedRole('');
    setAssignDialogVisible(true);
  };

  const handleRemoveRole = (user: User, roleName: string) => {
    confirmDialog({
      message: t('admin.users.confirmRemoveRole', { role: roleName, user: user.name }),
      header: t('admin.users.confirmRemoveRoleTitle'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => performRemoveRole(user.id, roleName),
    });
  };

  const performAssignRole = async () => {
    if (!selectedUser || !selectedRole) return;

    setAssignLoading(true);
    try {
      const headers = getAdminHeaders();
      if (!headers) {
        showNotification(t('admin.errors.unauthorized'), 'error');
        return;
      }

      const response = await fetch(ADMIN_ENDPOINTS.ASSIGN_ROLE, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          user_id: selectedUser.id,
          role_name: selectedRole,
        }),
      });

      if (!response.ok) {
        throw new Error(t('admin.errors.assignRoleFailed'));
      }

      showNotification(t('admin.users.roleAssigned'), 'success');
      setAssignDialogVisible(false);
      fetchUsers();
    } catch (err) {
      showNotification(err instanceof Error ? err.message : t('admin.errors.assignRoleFailed'), 'error');
    } finally {
      setAssignLoading(false);
    }
  };

  const performRemoveRole = async (userId: number, roleName: string) => {
    try {
      const headers = getAdminHeaders();
      if (!headers) {
        showNotification(t('admin.errors.unauthorized'), 'error');
        return;
      }

      const response = await fetch(ADMIN_ENDPOINTS.REMOVE_ROLE, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          user_id: userId,
          role_name: roleName,
        }),
      });

      if (!response.ok) {
        throw new Error(t('admin.errors.removeRoleFailed'));
      }

      showNotification(t('admin.users.roleRemoved'), 'success');
      fetchUsers();
    } catch (err) {
      showNotification(err instanceof Error ? err.message : t('admin.errors.removeRoleFailed'), 'error');
    }
  };

  const rolesBodyTemplate = (rowData: User) => {
    return (
      <div className={styles.rolesContainer}>
        {rowData.roles && rowData.roles.length > 0 ? (
          rowData.roles.map((role, index) => (
            <div key={index} className={styles.roleItem}>
              <Tag
                value={role.role_name}
                severity={role.role_name === 'admin' ? 'danger' : role.role_name === 'editor' ? 'warning' : 'info'}
                className={styles.roleTag}
              />
              <Button
                icon="pi pi-times"
                onClick={() => handleRemoveRole(rowData, role.role_name)}
                text
                rounded
                size="small"
                severity="danger"
                className={styles.removeRoleButton}
                title={t('admin.users.removeRole')}
              />
            </div>
          ))
        ) : (
          <Tag value={t('admin.users.noRoles')} severity="secondary" />
        )}
        <Button
          icon="pi pi-plus-circle"
          onClick={() => handleAssignRole(rowData)}
          text
          rounded
          size="small"
          severity="success"
          className={styles.addRoleButton}
          title={t('admin.users.assignRole')}
        />
      </div>
    );
  };

  const actionsBodyTemplate = (rowData: User) => {
    return (
      <div className={styles.actions}>
        <Button
          icon="pi pi-user-plus"
          label={t('admin.users.assignRole')}
          onClick={() => handleAssignRole(rowData)}
          size="small"
          severity="success"
          className={styles.actionButton}
          title={t('admin.users.assignRole')}
        />
      </div>
    );
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <>
      <SEO
        title={`${t('admin.navigation.users')} - ${t('app.title')}`}
        description="User management"
        url={currentUrl}
        noindex={true}
      />
      <ConfirmDialog />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>{t('admin.navigation.users')}</h1>
          <Button
            icon="pi pi-refresh"
            label={t('common.refresh')}
            onClick={fetchUsers}
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
            <DataTable
              value={users}
              paginator
              rows={10}
              rowsPerPageOptions={[10, 25, 50]}
              emptyMessage={t('admin.users.noUsers')}
              className={styles.dataTable}
            >
              <Column field="id" header={t('admin.users.id')} sortable style={{ width: '80px' }} />
              <Column field="name" header={t('admin.users.name')} sortable />
              <Column field="username" header={t('admin.users.username')} sortable />
              <Column field="email" header={t('admin.users.email')} sortable />
              <Column
                header={t('admin.users.roles')}
                body={rolesBodyTemplate}
                style={{ minWidth: '200px' }}
              />
              <Column
                header={t('admin.users.actions')}
                body={actionsBodyTemplate}
                style={{ minWidth: '250px' }}
              />
            </DataTable>
          </Card>
        )}

        <Dialog
          visible={assignDialogVisible}
          onHide={() => setAssignDialogVisible(false)}
          header={t('admin.users.assignRoleTitle')}
          modal
          style={{ width: '90vw', maxWidth: '500px' }}
        >
          <div className={styles.assignDialog}>
            <p>{t('admin.users.assignRoleMessage', { user: selectedUser?.name })}</p>
            <div className={styles.formField}>
              <label>{t('admin.users.selectRole')}</label>
              <Dropdown
                value={selectedRole}
                options={roles}
                onChange={(e) => setSelectedRole(e.value)}
                placeholder={t('admin.users.selectRolePlaceholder')}
                className={styles.dropdown}
                appendTo="self"
              />
            </div>
            <div className={styles.dialogActions}>
              <Button
                label={t('common.cancel')}
                onClick={() => setAssignDialogVisible(false)}
                severity="secondary"
                outlined
              />
              <Button
                label={t('admin.users.assign')}
                onClick={performAssignRole}
                loading={assignLoading}
                disabled={!selectedRole}
              />
            </div>
          </div>
        </Dialog>
      </div>
    </>
  );
};

export default UsersManagement;

