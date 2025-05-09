import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';

interface BasicInfoSectionProps {
  isEditable: boolean;
  mode: 'create' | 'edit';
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({ isEditable, mode }) => {
  const { register, formState: { errors }, watch, setValue } = useFormContext();
  const [expanded, setExpanded] = useState(true);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  // Get existing avatar if any
  const avatar = watch('avatar');
  
  // Handle avatar upload
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setAvatarPreview(reader.result.toString());
          setValue('avatar', reader.result.toString());
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  return (
    <div className="mb-8 border border-gray-200 rounded-md overflow-hidden">
      <div 
        className="bg-gray-50 px-4 py-3 flex justify-between items-center cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <h2 className="text-lg font-medium text-gray-900">Thông tin Cơ bản & Cá nhân</h2>
        <button type="button" className="text-gray-400 hover:text-gray-500">
          {expanded ? (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>
      </div>
      
      {expanded && (
        <div className="px-4 py-5 bg-white sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 flex items-start gap-4">
              {/* Avatar Upload */}
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full overflow-hidden mb-2 flex items-center justify-center">
                  {avatarPreview || avatar ? (
                    <img 
                      src={avatarPreview || avatar} 
                      alt="Avatar Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg className="h-12 w-12 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  )}
                </div>
                {isEditable && (
                  <div>
                    <label 
                      htmlFor="avatar-upload" 
                      className="cursor-pointer inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Tải lên
                    </label>
                    <input 
                      id="avatar-upload" 
                      type="file" 
                      accept="image/*" 
                      className="sr-only" 
                      onChange={handleAvatarChange}
                    />
                  </div>
                )}
              </div>
              
              {/* Employee Code and Name */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="employeeCode" className="block text-sm font-medium text-gray-700">
                    Mã nhân viên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="employeeCode"
                    autoComplete="off"
                    disabled={mode === 'edit' || !isEditable}
                    className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                      !isEditable || mode === 'edit' ? 'bg-gray-100' : ''
                    }`}
                    {...register('employeeCode')}
                  />
                  {errors.employeeCode && (
                    <p className="mt-1 text-sm text-red-600">{errors.employeeCode.message as string}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    autoComplete="name"
                    disabled={!isEditable}
                    className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                      !isEditable ? 'bg-gray-100' : ''
                    }`}
                    {...register('name')}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message as string}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Email and Internal User */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email công ty <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                autoComplete="email"
                disabled={!isEditable}
                className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                  !isEditable ? 'bg-gray-100' : ''
                }`}
                {...register('email')}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message as string}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="userId" className="block text-sm font-medium text-gray-700">
                Tài khoản nội bộ
              </label>
              <input
                type="text"
                id="userId"
                disabled={!isEditable}
                className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                  !isEditable ? 'bg-gray-100' : ''
                }`}
                {...register('userId')}
              />
            </div>
            
            {/* Birth Date and Phone */}
            <div>
              <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">
                Ngày sinh
              </label>
              <input
                type="date"
                id="birthDate"
                disabled={!isEditable}
                className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                  !isEditable ? 'bg-gray-100' : ''
                }`}
                {...register('birthDate')}
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Số điện thoại
              </label>
              <input
                type="tel"
                id="phone"
                autoComplete="tel"
                disabled={!isEditable}
                className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                  !isEditable ? 'bg-gray-100' : ''
                }`}
                {...register('phone')}
              />
            </div>
            
            {/* Address and Emergency Contact */}
            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Địa chỉ
              </label>
              <textarea
                id="address"
                rows={3}
                disabled={!isEditable}
                className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                  !isEditable ? 'bg-gray-100' : ''
                }`}
                {...register('address')}
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thông tin liên hệ khẩn cấp
              </label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="emergencyContactName" className="block text-sm font-medium text-gray-500">
                    Tên người liên hệ
                  </label>
                  <input
                    type="text"
                    id="emergencyContactName"
                    disabled={!isEditable}
                    className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                      !isEditable ? 'bg-gray-100' : ''
                    }`}
                    {...register('emergencyContact.name')}
                  />
                </div>
                
                <div>
                  <label htmlFor="emergencyContactPhone" className="block text-sm font-medium text-gray-500">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    id="emergencyContactPhone"
                    disabled={!isEditable}
                    className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                      !isEditable ? 'bg-gray-100' : ''
                    }`}
                    {...register('emergencyContact.phone')}
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="emergencyContactRelation" className="block text-sm font-medium text-gray-500">
                    Mối quan hệ
                  </label>
                  <input
                    type="text"
                    id="emergencyContactRelation"
                    disabled={!isEditable}
                    className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                      !isEditable ? 'bg-gray-100' : ''
                    }`}
                    {...register('emergencyContact.relation')}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BasicInfoSection; 