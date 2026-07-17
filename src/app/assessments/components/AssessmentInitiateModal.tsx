'use client';

import React, { useState } from 'react';
import { X, ChevronDown, ClipboardList } from 'lucide-react';

const VENDORS = [
  { id: 'vendor-001', name: 'Interswitch Group' },
  { id: 'vendor-002', name: 'Flutterwave Inc.' },
  { id: 'vendor-003', name: 'Paystack (Stripe)' },
  { id: 'vendor-004', name: 'MTN Nigeria' },
  { id: 'vendor-005', name: 'Huawei Technologies' },
  { id: 'vendor-006', name: 'Microsoft Nigeria' },
  { id: 'vendor-007', name: 'Oracle Financial' },
  { id: 'vendor-008', name: 'Cisco Systems' },
];

const FRAMEWORKS = ['ISO 27001', 'NDPR', 'PCI-DSS', 'SOC 2 Type II', 'CBN TPRMF', 'NIST CSF'];
const ASSESSMENT_TYPES = ['Full Risk Assessment', 'Questionnaire Only', 'Control Spot-Check', 'Annual Review', 'Onboarding Assessment', 'Incident-Triggered'];

interface AssessmentInitiateModalProps {
  onClose: () => void;
  onSubmit: (data: InitiateFormData) => void;
}

export interface InitiateFormData {
  vendorId: string;
  vendorName: string;
  assessmentType: string;
  frameworks: string[];
  dueDate: string;
  assignee: string;
  notes: string;
}

export default function AssessmentInitiateModal({ onClose, onSubmit }: AssessmentInitiateModalProps) {
  const [form, setForm] = useState<InitiateFormData>({
    vendorId: '',
    vendorName: '',
    assessmentType: '',
    frameworks: [],
    dueDate: '',
    assignee: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof InitiateFormData, string>>>({});

  const toggleFramework = (fw: string) => {
    setForm((prev) => ({
      ...prev,
      frameworks: prev.frameworks.includes(fw)
        ? prev.frameworks.filter((f) => f !== fw)
        : [...prev.frameworks, fw],
    }));
  };

  const validate = () => {
    const e: Partial<Record<keyof InitiateFormData, string>> = {};
    if (!form.vendorId) e.vendorId = 'Select a vendor';
    if (!form.assessmentType) e.assessmentType = 'Select assessment type';
    if (form.frameworks.length === 0) e.frameworks = 'Select at least one framework';
    if (!form.dueDate) e.dueDate = 'Set a due date';
    if (!form.assignee.trim()) e.assignee = 'Assign to a team member';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit(form);
  };

  const selectVendor = (id: string) => {
    const v = VENDORS.find((v) => v.id === id);
    setForm((prev) => ({ ...prev, vendorId: id, vendorName: v?.name ?? '' }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-xl w-full max-w-lg mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <ClipboardList size={18} className="text-primary" />
            <h2 className="text-base font-semibold text-foreground">Initiate Risk Assessment</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Vendor */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Vendor *</label>
            <div className="relative">
              <select
                value={form.vendorId}
                onChange={(e) => selectVendor(e.target.value)}
                className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground appearance-none focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Select vendor…</option>
                {VENDORS.map((v) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
            {errors.vendorId && <p className="text-xs text-status-critical mt-1">{errors.vendorId}</p>}
          </div>

          {/* Assessment Type */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Assessment Type *</label>
            <div className="relative">
              <select
                value={form.assessmentType}
                onChange={(e) => setForm((p) => ({ ...p, assessmentType: e.target.value }))}
                className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground appearance-none focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Select type…</option>
                {ASSESSMENT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
            {errors.assessmentType && <p className="text-xs text-status-critical mt-1">{errors.assessmentType}</p>}
          </div>

          {/* Frameworks */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Compliance Frameworks *</label>
            <div className="flex flex-wrap gap-2">
              {FRAMEWORKS.map((fw) => {
                const selected = form.frameworks.includes(fw);
                return (
                  <button
                    key={fw}
                    type="button"
                    onClick={() => toggleFramework(fw)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-all duration-150 ${
                      selected
                        ? 'bg-primary/20 border-primary text-primary' :'bg-muted border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                    }`}
                  >
                    {fw}
                  </button>
                );
              })}
            </div>
            {errors.frameworks && <p className="text-xs text-status-critical mt-1">{errors.frameworks}</p>}
          </div>

          {/* Due Date + Assignee */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Due Date *</label>
              <div className="relative">
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
                  className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              {errors.dueDate && <p className="text-xs text-status-critical mt-1">{errors.dueDate}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Assigned To *</label>
              <input
                type="text"
                placeholder="e.g. Olumide Fashola"
                value={form.assignee}
                onChange={(e) => setForm((p) => ({ ...p, assignee: e.target.value }))}
                className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {errors.assignee && <p className="text-xs text-status-critical mt-1">{errors.assignee}</p>}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Notes / Scope</label>
            <textarea
              rows={3}
              placeholder="Describe assessment scope, triggers, or special instructions…"
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-muted border border-border text-sm font-medium text-foreground hover:bg-secondary transition-all duration-150"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all duration-150 active:scale-95"
          >
            Initiate Assessment
          </button>
        </div>
      </div>
    </div>
  );
}
