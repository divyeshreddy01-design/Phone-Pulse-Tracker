import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Person, UserType } from '../../types';
import { fromTotalMinutes, toTotalMinutes } from '../../utils/calculations';

interface PersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (personData: Omit<Person, 'id' | 'createdAt'>, personId?: string) => void;
  personToEdit?: Person | null;
}

export const PersonModal: React.FC<PersonModalProps> = ({
  isOpen,
  onClose,
  onSave,
  personToEdit,
}) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState<number | ''>(22);
  const [gender, setGender] = useState<string>('Prefer not to say');
  const [userType, setUserType] = useState<UserType>('Student');
  const [phoneModel, setPhoneModel] = useState('');
  
  // Goal state: predefined hours or custom
  const [goalPreset, setGoalPreset] = useState<'120' | '180' | '240' | '300' | 'custom'>('240');
  const [customHours, setCustomHours] = useState(4);
  const [customMinutes, setCustomMinutes] = useState(0);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (personToEdit) {
      setName(personToEdit.name);
      setAge(personToEdit.age);
      setGender(personToEdit.gender || 'Prefer not to say');
      setUserType(personToEdit.userType);
      setPhoneModel(personToEdit.phoneModel || '');

      const goalMins = personToEdit.dailyGoalMinutes;
      if (['120', '180', '240', '300'].includes(String(goalMins))) {
        setGoalPreset(String(goalMins) as any);
      } else {
        setGoalPreset('custom');
        const split = fromTotalMinutes(goalMins);
        setCustomHours(split.hours);
        setCustomMinutes(split.minutes);
      }
    } else {
      setName('');
      setAge(22);
      setGender('Prefer not to say');
      setUserType('Student');
      setPhoneModel('');
      setGoalPreset('240');
      setCustomHours(4);
      setCustomMinutes(0);
    }
    setErrors({});
  }, [personToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (age === '' || Number(age) <= 0 || Number(age) > 120) {
      newErrors.age = 'Please enter a valid age between 1 and 120';
    }

    let dailyGoalMinutes = 240;
    if (goalPreset === 'custom') {
      const calculated = toTotalMinutes(customHours, customMinutes);
      if (calculated <= 0) {
        newErrors.goal = 'Daily screen-time goal must be greater than 0';
      } else if (calculated > 24 * 60) {
        newErrors.goal = 'Daily goal cannot exceed 24 hours';
      }
      dailyGoalMinutes = calculated;
    } else {
      dailyGoalMinutes = Number(goalPreset);
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(
      {
        name: name.trim(),
        age: Number(age),
        gender,
        userType,
        phoneModel: phoneModel.trim() || undefined,
        dailyGoalMinutes,
      },
      personToEdit?.id
    );
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={personToEdit ? 'Edit Person Profile' : 'Enter User Details'}
      subtitle="Set up profile information and daily screen-time limit"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Aarav Sharma"
            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 ${
              errors.name
                ? 'border-rose-500 focus:ring-rose-500/20'
                : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20'
            }`}
          />
          {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
        </div>

        {/* Age & Gender */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
              Age <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              max="120"
              value={age}
              onChange={e => setAge(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="e.g. 21"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 ${
                errors.age
                  ? 'border-rose-500 focus:ring-rose-500/20'
                  : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20'
              }`}
            />
            {errors.age && <p className="text-xs text-rose-500 mt-1">{errors.age}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
              Gender (Optional)
            </label>
            <select
              value={gender}
              onChange={e => setGender(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Non-binary">Non-binary</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>
        </div>

        {/* User Type */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
            User Type <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(['Student', 'Working Person', 'Senior Citizen', 'Other'] as UserType[]).map(type => (
              <button
                type="button"
                key={type}
                onClick={() => setUserType(type)}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                  userType === type
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Phone Model */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
            Android Phone Model (Optional)
          </label>
          <input
            type="text"
            value={phoneModel}
            onChange={e => setPhoneModel(e.target.value)}
            placeholder="e.g. Samsung Galaxy S24, Pixel 8, OnePlus 12"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Daily Screen-Time Goal */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
            What is your daily screen-time goal?
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
            {[
              { label: '2 hours', value: '120' },
              { label: '3 hours', value: '180' },
              { label: '4 hours', value: '240' },
              { label: '5 hours', value: '300' },
              { label: 'Custom', value: 'custom' },
            ].map(opt => (
              <button
                type="button"
                key={opt.value}
                onClick={() => setGoalPreset(opt.value as any)}
                className={`py-2 px-2 rounded-xl border text-xs font-semibold text-center transition-all ${
                  goalPreset === opt.value
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Custom Time inputs */}
          {goalPreset === 'custom' && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Hours:
                </label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={customHours}
                  onChange={e => setCustomHours(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white"
                />
              </div>
              <div className="flex-1">
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Minutes:
                </label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={customMinutes}
                  onChange={e => setCustomMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}
          {errors.goal && <p className="text-xs text-rose-500 mt-1">{errors.goal}</p>}
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition-colors"
          >
            {personToEdit ? 'Save Changes' : 'Continue'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
