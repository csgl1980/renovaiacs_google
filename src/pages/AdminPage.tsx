import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { useSession } from '../components/SessionContextProvider';
import type { User } from '../types';
import CoinIcon from '../components/icons/CoinIcon';
import UserIcon from '../components/icons/UserIcon';
import XCircleIcon from '../components/icons/XCircleIcon';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading: isSessionLoading, refreshUser } = useSession();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newCredits, setNewCredits] = useState<number>(0);

  useEffect(() => {
    if (!isSessionLoading && (!user || !user.is_admin)) {
      navigate('/'); // Redireciona para a home se não for admin
    }
  }, [user, isSessionLoading, navigate]);

  useEffect(() => {
    const fetchAllUsers = async () => {
      setIsLoadingUsers(true);
      setError(null);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, credits, is_admin')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar todos os usuários:', error);
        setError('Não foi possível carregar os usuários.');
      } else {
        setAllUsers(data as User[]);
      }
      setIsLoadingUsers(false);
    };

    if (user && user.is_admin) {
      fetchAllUsers();
    }
  }, [user]);

  const handleEditCredits = (userToEdit: User) => {
    setEditingUserId(userToEdit.id);
    setNewCredits(userToEdit.credits);
  };

  const handleSaveCredits = async (userId: string) => {
    setError(null);
    const { error } = await supabase
      .from('profiles')
      .update({ credits: newCredits })
      .eq('id', userId);

    if (error) {
      console.error('Erro ao atualizar créditos:', error);
      setError('Não foi possível atualizar os créditos.');
    } else {
      setAllUsers(prevUsers =>
        prevUsers.map(u => (u.id === userId ? { ...u, credits: newCredits } : u))
      );
      setEditingUserId(null);
      if (user?.id === userId) { // If admin is editing their own credits
        refreshUser();
      }
    }
  };

  if (isSessionLoading || !user || !user.is_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 mt-4">
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between mb-6 border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <UserIcon className="w-7 h-7 text-indigo-500" />
            Painel de Administração
          </h2>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-md transition-colors"
          >
            <XCircleIcon className="w-4 h-4" />
            Voltar
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Erro:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        {isLoadingUsers ? (
          <div className="text-center text-gray-600 p-8">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="font-semibold">Carregando usuários...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Nome</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Email</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Admin</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Créditos</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Ações</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map((u) => (
                  <tr key={u.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {u.first_name} {u.last_name}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">{u.email}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {u.is_admin ? 'Sim' : 'Não'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {editingUserId === u.id ? (
                        <input
                          type="number"
                          value={newCredits}
                          onChange={(e) => setNewCredits(parseInt(e.target.value))}
                          className="w-24 p-1 border border-gray-300 rounded-md text-sm"
                        />
                      ) : (
                        <div className="flex items-center gap-1">
                          <CoinIcon className="w-4 h-4 text-amber-500" />
                          {u.credits}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {editingUserId === u.id ? (
                        <button
                          onClick={() => handleSaveCredits(u.id)}
                          className="bg-indigo-600 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-indigo-700 transition-colors"
                        >
                          Salvar
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEditCredits(u)}
                          className="bg-gray-200 text-gray-800 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-gray-300 transition-colors"
                        >
                          Editar Créditos
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;