import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Plus,
  ArrowUpRight,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Download,
  Sparkles,
  Layers
} from 'lucide-react';
import { api } from '../api/client';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { SearchInput } from '../components/common/SearchInput';
import type { Payment, Client, ClientPackage, PackageTemplate } from '../types';

export const PaymentsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [recordPaymentOpen, setRecordPaymentOpen] = useState(false);

  const [paymentForm, setPaymentForm] = useState({
    client_id: '',
    client_package_id: '',
    amount: 15000,
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'UPI' as const,
    transaction_id: '',
    notes: '',
  });

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: () => api.getPayments(),
  });

  const { data: summary } = useQuery({
    queryKey: ['financial-summary'],
    queryFn: () => api.getFinancialSummary(),
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => api.getClients(),
  });

  const { data: clientPackages = [] } = useQuery({
    queryKey: ['client-packages'],
    queryFn: () => api.getClientPackages(),
  });

  const { data: packageTemplates = [] } = useQuery({
    queryKey: ['package-templates'],
    queryFn: () => api.getPackageTemplates(),
  });

  const recordPaymentMutation = useMutation({
    mutationFn: (data: any) => api.recordPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['client-packages'] });
      setRecordPaymentOpen(false);
    },
  });

  const filteredPayments = payments.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.payment_id.toLowerCase().includes(q) ||
      p.client_name?.toLowerCase().includes(q) ||
      p.payment_method.toLowerCase().includes(q) ||
      (p.transaction_id && p.transaction_id.toLowerCase().includes(q))
    );
  });

  const isTemplate = paymentForm.client_package_id.startsWith('template:');
  const selectedTemplateId = isTemplate ? paymentForm.client_package_id.replace('template:', '') : '';
  const selectedTemplate = packageTemplates.find((t) => t.id === selectedTemplateId);
  const selectedPkg = clientPackages.find((cp) => cp.id === paymentForm.client_package_id);
  const clientActivePkgs = clientPackages.filter((p) => paymentForm.client_id && p.client_id === paymentForm.client_id);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            Agency Financial & Payments Ledger
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track client installments, advance retainers, payment balances, and payment transaction references.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (clients.length > 0) {
              const firstCli = clients[0];
              const clientPkgs = clientPackages.filter((p) => p.client_id === firstCli.id);
              const firstPkg = clientPkgs[0];
              const initialPkgId = firstPkg
                ? firstPkg.id
                : packageTemplates.length > 0
                ? `template:${packageTemplates[0].id}`
                : '';
              const initialAmount = firstPkg
                ? (firstPkg.remaining_balance ?? firstPkg.final_price ?? 15000)
                : (packageTemplates[0]?.price ?? 25000);

              setPaymentForm({
                ...paymentForm,
                client_id: firstCli.id,
                client_package_id: initialPkgId,
                amount: initialAmount,
              });
            }
            setRecordPaymentOpen(true);
          }}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Record Installment
        </button>
      </div>

      {/* 4 Financial Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Collected Revenue"
          value={`₹${(summary?.total_revenue || 0).toLocaleString()}`}
          subtitle="All-time cleared payments"
          icon={CreditCard}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />

        <StatCard
          title="This Month's Inflow"
          value={`₹${(summary?.current_month_revenue || 0).toLocaleString()}`}
          subtitle="Current billing cycle"
          icon={TrendingUp}
          iconColor="text-brand-600"
          iconBg="bg-brand-50"
        />

        <StatCard
          title="Pending Client Balances"
          value={`₹${(summary?.pending_balance || 0).toLocaleString()}`}
          subtitle="Outstanding receivables"
          icon={AlertTriangle}
          iconColor="text-rose-600"
          iconBg="bg-rose-50"
        />

        <StatCard
          title="Total Contract Value"
          value={`₹${(summary?.total_contract_value || 0).toLocaleString()}`}
          subtitle={`${summary?.packages_count?.total || 0} Total Retainers`}
          icon={Receipt}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
      </div>

      {/* Search and Table */}
      <div className="card-base p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="text-sm font-bold text-slate-900">All Payment Transactions ({filteredPayments.length})</h3>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by Payment ID, Client, Ref..."
            className="w-full sm:w-72"
          />
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Payment ID</th>
                <th className="px-4 py-3.5">Client Account</th>
                <th className="px-4 py-3.5">Package</th>
                <th className="px-4 py-3.5">Payment Date</th>
                <th className="px-4 py-3.5">Amount</th>
                <th className="px-4 py-3.5">Method</th>
                <th className="px-4 py-3.5">Transaction ID</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Recorded By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredPayments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-slate-900">{p.payment_id}</td>
                  <td className="px-4 py-3.5">
                    <button
                      onClick={() => navigate(`/clients/${p.client_id}`)}
                      className="font-bold text-brand-600 hover:underline"
                    >
                      {p.client_name}
                    </button>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">{p.package_name || 'Agency Retainer'}</td>
                  <td className="px-4 py-3.5 text-slate-600">{p.payment_date}</td>
                  <td className="px-4 py-3.5 font-black text-emerald-700">₹{p.amount.toLocaleString()}</td>
                  <td className="px-4 py-3.5 font-semibold text-slate-700">{p.payment_method}</td>
                  <td className="px-4 py-3.5 font-mono text-[11px] text-slate-500">{p.transaction_id || 'N/A'}</td>
                  <td className="px-4 py-3.5"><StatusBadge status={p.status} size="sm" /></td>
                  <td className="px-4 py-3.5 text-slate-500">{p.recorded_by_name || 'System Admin'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECORD PAYMENT MODAL */}
      <Modal
        isOpen={recordPaymentOpen}
        onClose={() => setRecordPaymentOpen(false)}
        title="Record Client Payment Installment"
        subtitle="Capture cleared payments with automatic balance deduction."
        maxWidth="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            recordPaymentMutation.mutate(paymentForm);
          }}
          className="space-y-4 text-xs"
        >
          <div>
            <label className="block font-bold text-slate-700 mb-1">Select Client *</label>
            <select
              required
              value={paymentForm.client_id}
              onChange={(e) => {
                const cId = e.target.value;
                const clientPkgs = clientPackages.filter((cp) => cp.client_id === cId);
                let nextPkgId = '';
                let nextAmount = 15000;

                if (clientPkgs.length > 0) {
                  nextPkgId = clientPkgs[0].id;
                  nextAmount = clientPkgs[0].remaining_balance ?? clientPkgs[0].final_price ?? 15000;
                } else if (packageTemplates.length > 0) {
                  nextPkgId = `template:${packageTemplates[0].id}`;
                  nextAmount = packageTemplates[0].price || 25000;
                }

                setPaymentForm({
                  ...paymentForm,
                  client_id: cId,
                  client_package_id: nextPkgId,
                  amount: nextAmount,
                });
              }}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
            >
              <option value="">Select a client...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.business_name} ({c.client_id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Select Package / Retainer Template *</label>
            <select
              required
              value={paymentForm.client_package_id}
              onChange={(e) => {
                const val = e.target.value;
                if (val.startsWith('template:')) {
                  const tplId = val.replace('template:', '');
                  const tpl = packageTemplates.find((t) => t.id === tplId);
                  setPaymentForm({
                    ...paymentForm,
                    client_package_id: val,
                    amount: tpl ? tpl.price : paymentForm.amount,
                  });
                } else {
                  const pkg = clientPackages.find((p) => p.id === val);
                  setPaymentForm({
                    ...paymentForm,
                    client_package_id: val,
                    amount: pkg?.remaining_balance ? pkg.remaining_balance : (pkg?.final_price || paymentForm.amount),
                  });
                }
              }}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
            >
              <option value="">-- Select Package or Template --</option>
              {clientActivePkgs.length > 0 && (
                <optgroup label="📦 Active Client Retainer Packages">
                  {clientActivePkgs.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.package_name} (Remaining Balance: ₹{(p.remaining_balance ?? p.final_price ?? 0).toLocaleString()})
                    </option>
                  ))}
                </optgroup>
              )}
              <optgroup label="✨ Assign New Package Template">
                {packageTemplates.map((tpl) => (
                  <option key={tpl.id} value={`template:${tpl.id}`}>
                    ⚡ {tpl.name} — ₹{tpl.price.toLocaleString()} ({tpl.reels_count} Reels, {tpl.shoot_count} Shoot)
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {clientActivePkgs.length === 0 && paymentForm.client_id && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>This client does not have an active package yet. Select a template above to assign and record payment.</span>
            </div>
          )}

          {selectedPkg && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between text-xs font-semibold">
              <span className="text-slate-600">Package Contract Value: ₹{selectedPkg.final_price.toLocaleString()}</span>
              <span className="text-rose-600 font-bold">Outstanding Balance: ₹{(selectedPkg.remaining_balance ?? selectedPkg.final_price ?? 0).toLocaleString()}</span>
            </div>
          )}

          {selectedTemplate && (
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex justify-between text-xs font-semibold">
              <span className="text-indigo-900 flex items-center gap-1.5 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Assign Retainer: {selectedTemplate.name}
              </span>
              <span className="text-emerald-700 font-extrabold">Price: ₹{selectedTemplate.price.toLocaleString()}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Amount Paid (₹) *</label>
              <input
                type="number"
                required
                min={1}
                max={selectedPkg ? (selectedPkg.remaining_balance || selectedPkg.final_price) : (selectedTemplate ? selectedTemplate.price : undefined)}
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold text-sm"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Payment Method</label>
              <select
                value={paymentForm.payment_method}
                onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
              >
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Payment Date</label>
              <input
                type="date"
                required
                value={paymentForm.payment_date}
                onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Transaction Ref / ID</label>
              <input
                type="text"
                placeholder="e.g. HDFC-992019482"
                value={paymentForm.transaction_id}
                onChange={(e) => setPaymentForm({ ...paymentForm, transaction_id: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Notes / Remarks</label>
            <textarea
              rows={2}
              placeholder="e.g. 50% advance before 2nd shoot"
              value={paymentForm.notes}
              onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setRecordPaymentOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-lg font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={recordPaymentMutation.isPending}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-sm"
            >
              {recordPaymentMutation.isPending ? 'Recording...' : 'Save Payment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
