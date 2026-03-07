import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Department, DEPARTMENTS } from '@/data/stores';

export function useDepartmentAuth(storeId: string | undefined) {
  const isDemo = storeId === 'demo';
  const [unlockedDepts, setUnlockedDepts] = useState<Set<Department>>(
    isDemo ? new Set(DEPARTMENTS) : new Set()
  );
  const [loading, setLoading] = useState(false);

  // Auto-unlock all departments for DEMO store
  useEffect(() => {
    if (isDemo) {
      setUnlockedDepts(new Set(DEPARTMENTS));
    }
  }, [isDemo]);

  // Initialize default passwords for this store if they don't exist
  useEffect(() => {
    if (!storeId || isDemo) return;
    const init = async () => {
      for (const dept of DEPARTMENTS) {
        await supabase
          .from('department_passwords')
          .upsert(
            { store_id: storeId, departamento: dept, password: 'Anny90pro' },
            { onConflict: 'store_id,departamento', ignoreDuplicates: true }
          );
      }
    };
    init();
  }, [storeId, isDemo]);

  const verifyPassword = useCallback(async (dept: Department, password: string): Promise<boolean> => {
    if (!storeId) return false;
    setLoading(true);
    try {
      const { data } = await supabase
        .from('department_passwords')
        .select('password')
        .eq('store_id', storeId)
        .eq('departamento', dept)
        .single();

      if (data && data.password === password) {
        setUnlockedDepts(prev => new Set(prev).add(dept));
        return true;
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  const changePassword = useCallback(async (dept: Department, currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (!storeId) return { success: false, error: 'Sin tienda' };
    
    const { data } = await supabase
      .from('department_passwords')
      .select('password')
      .eq('store_id', storeId)
      .eq('departamento', dept)
      .single();

    if (!data || data.password !== currentPassword) {
      return { success: false, error: 'Contraseña actual incorrecta' };
    }

    const { error } = await supabase
      .from('department_passwords')
      .update({ password: newPassword, updated_at: new Date().toISOString() })
      .eq('store_id', storeId)
      .eq('departamento', dept);

    if (error) return { success: false, error: error.message };
    return { success: true };
  }, [storeId]);

  const isDeptUnlocked = (dept: Department) => unlockedDepts.has(dept);

  const lockDept = (dept: Department) => {
    setUnlockedDepts(prev => {
      const next = new Set(prev);
      next.delete(dept);
      return next;
    });
  };

  return { isDeptUnlocked, verifyPassword, changePassword, lockDept, loading };
}
