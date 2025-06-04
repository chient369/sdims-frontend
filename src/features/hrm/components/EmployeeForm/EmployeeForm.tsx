import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import useAuth from '../../../../hooks/useAuth';
import { useEmployeeService, useSkillService } from '../../hooks/useServices';
// import { employeeService, skillService } from '../../service'; // skillService tạm thời không dùng
import { 
  NewEmployeeApiResponse,
  EmployeeCreateData,
  NewEmployeeSkillResponse,
  SkillLevel,
  EmployeeSkillCreateData,
  StatusUpdateRequest
} from '../../types';
// import { addOrUpdateEmployeeSkill } from '../../api'; // Tạm thời không dùng

import BasicInfoSection from './sections/BasicInfoSection';
import OrganizationSection from './sections/OrganizationSection'; // Uncommented
import SkillsSection from './sections/SkillsSection'; // Uncommented
import StatusSection from './sections/StatusSection'; // Uncomment StatusSection

// Structure for skills used by SkillsSection and form state
interface ExtendedEmployeeSkillData {
  employeeSkillId?: number; // ID of the EmployeeSkillDto (link table record)
  skillId: number;         // ID of the actual Skill (from SkillDto)
  skillName?: string;       // For display purposes
  categoryId?: number;      // ID of the skill category
  categoryName?: string;    // For display purposes
  level: SkillLevel;       // Self-assessed level
  years: number;
  selfComment?: string;     // Self-assessed comment
  leaderAssessment?: SkillLevel | null; 
  leaderComment?: string | null;      
}

// Updated EmployeeData to match BasicInfoSection and OrganizationSection fields
interface EmployeeData {
  id?: number;
  employeeCode: string;
  name?: string; 
  email?: string; 
  phone?: string;
  avatar?: string;
  address?: string;
  birthDate?: string;
  hireDate?: string; // Used by OrganizationSection and BasicInfoSection
  userId?: string | null; 
  emergencyContact?: {
    name?: string;
    phone?: string;
    relation?: string;
  };
  position?: string; // For OrganizationSection
  teamId?: number | string | null; // For OrganizationSection
  reportingLeaderId?: number | string | null; // For OrganizationSection

  // Fields from StatusSection
  status?: string; // Current employee status (e.g., Available, Allocated)
  statusProjectName?: string;
  statusClientName?: string; // Hidden, derived from selected project
  statusProjectContractId?: number | string; // Hidden, derived from selected project
  statusProjectStartDate?: string; // Allocation start date
  statusProjectEndDate?: string; // Allocation end date (expected)
  statusAllocationPercentage?: number;
  statusIsBillable?: boolean;
  statusNote?: string; // General note for the status
  resignationDate?: string; // If status is 'Resigned'
  leaveStartDate?: string; // If status is 'On Leave'
  leaveEndDate?: string; // If status is 'On Leave'
}

interface EmployeeFormProps {
  employeeId?: number;
  mode: 'create' | 'edit';
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ employeeId, mode }) => {
  console.log('[EmployeeForm REINTEGRATING SKILLS] Render - employeeId:', employeeId, 'mode:', mode);
  
  const { hasPermission, user } = useAuth();
  const employeeServiceFromHook = useEmployeeService();
  const skillService = useSkillService(); // Initialize skill service
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [potentialLeaders, setPotentialLeaders] = useState<NewEmployeeApiResponse[]>([]); // Added for OrganizationSection
  
  // State for skills
  const [skills, setSkills] = useState<ExtendedEmployeeSkillData[]>([]);
  const [initialSkillsForComparison, setInitialSkillsForComparison] = useState<NewEmployeeSkillResponse[]>([]);

  const canEdit = 
    hasPermission('employee:update:all') || 
    (!!employeeId && mode === 'edit'); 
  
  const formMethods = useForm<EmployeeData>({
    defaultValues: {
      employeeCode: '',
      name: '',
      email: '',
      phone: '',
      avatar: '',
      address: '',
      birthDate: '',
      hireDate: '',
      userId: '', 
      emergencyContact: {
        name: '',
        phone: '',
        relation: '',
      },
      position: '', // Added for OrganizationSection
      teamId: '', // Added for OrganizationSection
      reportingLeaderId: '', // Added for OrganizationSection

      // Defaults for StatusSection fields
      status: 'Available', // Default to 'Available' for new employees
      statusProjectName: '',
      statusClientName: '',
      statusProjectContractId: '',
      statusProjectStartDate: '',
      statusProjectEndDate: '',
      statusAllocationPercentage: undefined, // Or 0, depending on desired behavior
      statusIsBillable: false,
      statusNote: '',
      resignationDate: '',
      leaveStartDate: '',
      leaveEndDate: '',
    }
  });

  // Fetch employee data
  const {
    isLoading: isLoadingEmployee,
    data: employeeData,
    isError: isErrorEmployee,
    error: errorEmployeeQuery, 
  } = useQuery<NewEmployeeApiResponse, Error>({
    queryKey: ['employee', employeeId],
    queryFn: async () => {
      console.log('[EmployeeForm REINTEGRATING SKILLS] queryFn for employeeData START. employeeId:', employeeId);
      if (!employeeServiceFromHook || typeof employeeServiceFromHook.getEmployeeById !== 'function') {
        console.error('[EmployeeForm REINTEGRATING SKILLS] employeeServiceFromHook is invalid.');
        throw new Error('Employee service is not available for getEmployeeById.');
      }
      if (!employeeId) { 
          console.error('[EmployeeForm REINTEGRATING SKILLS] No employeeId in queryFn despite enabled=true.');
          throw new Error('Employee ID is undefined in queryFn.');
      }
      console.log('[EmployeeForm REINTEGRATING SKILLS] Attempting to call getEmployeeById for ID:', employeeId);
      const data = await employeeServiceFromHook.getEmployeeById(employeeId.toString());
      console.log('[EmployeeForm REINTEGRATING SKILLS] Fetched Employee Data INSIDE queryFn:', data);
      return data;
    },
    enabled: !!employeeId && mode === 'edit',
  });

  // Fetch employee skills
  const {
    data: fetchedSkillsData,
    isLoading: isLoadingSkills,
    isError: isErrorSkills,
    error: errorSkillsQuery,
  } = useQuery<NewEmployeeSkillResponse[], Error>({
    queryKey: ['employeeSkills', employeeId],
    queryFn: async () => {
      console.log('[EmployeeForm REINTEGRATING SKILLS] queryFn for employeeSkills START. employeeId:', employeeId);
      if (!skillService || typeof skillService.getEmployeeSkills !== 'function') {
        throw new Error('Skill service is not available for getEmployeeSkills.');
      }
      if (!employeeId) throw new Error('Employee ID is undefined for fetching skills.');
      const data = await skillService.getEmployeeSkills(employeeId.toString());
      console.log('[EmployeeForm REINTEGRATING SKILLS] Fetched Employee Skills Data:', data);
      return data;
    },
    enabled: !!employeeId && mode === 'edit',
  });

  // Fetch potential leaders for OrganizationSection
  const {
    isLoading: isLoadingLeaders,
    data: leadersData,
    isError: isErrorLeaders,
    error: errorLeadersQuery,
  } = useQuery<NewEmployeeApiResponse[], Error>({
    queryKey: ['potentialLeaders'],
    queryFn: async () => {
      console.log('[EmployeeForm REINTEGRATING SKILLS] queryFn for potentialLeaders START.');
      if (!employeeServiceFromHook || typeof employeeServiceFromHook.getEmployees !== 'function') {
        console.error('[EmployeeForm REINTEGRATING SKILLS] employeeServiceFromHook is invalid for getEmployees.');
        throw new Error('Employee service is not available for getEmployees.');
      }
      const response = await employeeServiceFromHook.getEmployees({ size: 100 }); // Fetch up to 100 employees
      console.log('[EmployeeForm REINTEGRATING SKILLS] Fetched potential leaders:', response.data.content);
      return response.data.content;
    },
    // enabled: mode === 'edit' || mode === 'create', // Always fetch for new/edit if form is visible
  });

  useEffect(() => {
    if (leadersData) {
      setPotentialLeaders(leadersData);
    }
  }, [leadersData]);

  useEffect(() => {
    if (isErrorEmployee && errorEmployeeQuery) {
      console.error('[EmployeeForm REINTEGRATING SKILLS] Error fetching employee data:', errorEmployeeQuery);
      setError(`Failed to fetch employee details: ${errorEmployeeQuery.message}`);
    }
    if (isErrorSkills && errorSkillsQuery) {
      console.error('[EmployeeForm REINTEGRATING SKILLS] Error fetching employee skills:', errorSkillsQuery);
      setError(`Failed to fetch employee skills: ${errorSkillsQuery.message}`);
    }
    if (isErrorLeaders && errorLeadersQuery) {
      console.error('[EmployeeForm REINTEGRATING SKILLS] Error fetching potential leaders:', errorLeadersQuery);
      setError(`Failed to fetch potential leaders: ${errorLeadersQuery.message}`);
    }
  }, [isErrorEmployee, errorEmployeeQuery, isErrorSkills, errorSkillsQuery, isErrorLeaders, errorLeadersQuery]);

  // Reset form with employee data
  useEffect(() => {
    if (employeeData && mode === 'edit') {
      console.log('[EmployeeForm REINTEGRATING SKILLS] Employee data available, attempting to reset form:', employeeData);
      try {
        let ecName = '';
        let ecPhone = '';
        let ecRelation = '';

        if (employeeData.emergencyContact) {
          const contactInfo = employeeData.emergencyContact; 
          const parts = contactInfo.split(';').map(part => part.trim());

          for (const part of parts) {
            if (part.startsWith('Name:')) {
              ecName = part.substring('Name:'.length).trim();
            } else if (part.startsWith('Phone:')) {
              ecPhone = part.substring('Phone:'.length).trim();
            } else if (part.startsWith('Relation:')) {
              ecRelation = part.substring('Relation:'.length).trim();
            }
          }
        }

        const formDataToReset: EmployeeData = {
          id: employeeData.id,
          employeeCode: employeeData.employeeCode,
          name: `${employeeData.firstName || ''} ${employeeData.lastName || ''}`.trim(),
          email: employeeData.companyEmail,
          phone: employeeData.phoneNumber || '',
          avatar: employeeData.profilePictureUrl || '',
          address: employeeData.address || '',
          birthDate: employeeData.birthDate ? new Date(employeeData.birthDate).toISOString().split('T')[0] : '',
          hireDate: employeeData.hireDate ? new Date(employeeData.hireDate).toISOString().split('T')[0] : '', // For OrganizationSection
          userId: employeeData.internalAccount || '', 
          emergencyContact: { 
            name: ecName,
            phone: ecPhone,
            relation: ecRelation,
          },
          position: employeeData.position || '', // For OrganizationSection
          teamId: employeeData.team?.id?.toString() || '', // Ensure string for select; For OrganizationSection
          reportingLeaderId: employeeData.reportingLeaderId?.toString() || '', // Ensure string for select; For OrganizationSection
          
          // Status fields - In a real scenario, these would ideally be populated from a fetched current status log.
          // For now, they will reset to defaults or previously saved form state if any.
          // If StatusSection is already part of the form, RHF might preserve its state across renders if not explicitly reset.
          status: employeeData.currentStatus || formMethods.getValues('status') || 'Available',
          // The following fields are not directly on employeeData, they would come from a status log or form state.
          // Resetting them to defaults or letting RHF manage them if StatusSection loads its own state initially.
          statusProjectName: formMethods.getValues('statusProjectName') || '',
          statusClientName: formMethods.getValues('statusClientName') || '',
          statusProjectContractId: formMethods.getValues('statusProjectContractId') || '',
          statusProjectStartDate: formMethods.getValues('statusProjectStartDate') || '',
          statusProjectEndDate: formMethods.getValues('statusProjectEndDate') || '',
          statusAllocationPercentage: formMethods.getValues('statusAllocationPercentage') ?? undefined,
          statusIsBillable: formMethods.getValues('statusIsBillable') || false,
          statusNote: formMethods.getValues('statusNote') || '',
          // Dates for Resigned/OnLeave - these would also ideally come from a status log or specific API if persisting
          resignationDate: formMethods.getValues('resignationDate') || '', 
          leaveStartDate: formMethods.getValues('leaveStartDate') || '',
          leaveEndDate: formMethods.getValues('leaveEndDate') || '',
        };
        console.log('[EmployeeForm REINTEGRATING SKILLS] Resetting Form With:', formDataToReset);
        formMethods.reset(formDataToReset);
      } catch (err: any) {
        console.error('[EmployeeForm REINTEGRATING SKILLS] Error processing employee data for form reset:', err);
        setError(`Failed to process employee data for display: ${err.message}`);
      }
    } else if (mode === 'edit' && !isLoadingEmployee && !employeeData) {
        console.warn('[EmployeeForm REINTEGRATING SKILLS] In edit mode, loading finished, but no employeeData to reset form.');
    }
  }, [employeeData, mode, formMethods, isLoadingEmployee]);

  // Map fetched skills to ExtendedEmployeeSkillData and set initial comparison data
  useEffect(() => {
    if (fetchedSkillsData && mode === 'edit') {
      console.log('[EmployeeForm REINTEGRATING SKILLS] Mapping fetched skills to ExtendedEmployeeSkillData:', fetchedSkillsData);
      setInitialSkillsForComparison(fetchedSkillsData);

      const extendedSkills: ExtendedEmployeeSkillData[] = fetchedSkillsData.map(detail => ({
        employeeSkillId: detail.id, 
        skillId: detail.skillId,
        skillName: detail.skillName, 
        categoryName: detail.skillCategoryName,
        level: detail.selfAssessmentLevel as SkillLevel, 
        years: detail.yearsExperience, 
        selfComment: detail.selfComment || '', 
        leaderAssessment: detail.leaderAssessmentLevel as SkillLevel | null || null, 
        leaderComment: detail.leaderComment || null,
      }));
      setSkills(extendedSkills);

      console.log('[EmployeeForm REINTEGRATING SKILLS] Skills state set with extended skills:', extendedSkills);
    }
  }, [fetchedSkillsData, mode]);

  // Callback for SkillsSection to update skills state
  const handleSkillsChange = (updatedSkills: ExtendedEmployeeSkillData[]) => {
    console.log('[EmployeeForm REINTEGRATING SKILLS] Skills updated by SkillsSection:', updatedSkills);
    setSkills(updatedSkills);
  };

  // Submit handler
  const onSubmit = async (data: EmployeeData) => {
      setIsSubmitting(true);
      setError(null);
    console.log('[EmployeeForm REINTEGRATING SKILLS] Submitting Form Data (main employee):', data);

    const nameParts = data.name?.split(' ') || [];
    const firstName = nameParts.shift() || ''; 
    const lastName = nameParts.join(' ') || '';  

    let emergencyContactString: string | undefined = undefined;
    if (data.emergencyContact && (data.emergencyContact.name || data.emergencyContact.phone || data.emergencyContact.relation)) {
      const ecName = data.emergencyContact.name || '';
      const ecPhone = data.emergencyContact.phone || '';
      const ecRelation = data.emergencyContact.relation || '';
      if (ecName || ecPhone || ecRelation) { 
        emergencyContactString = `Name: ${ecName}; Phone: ${ecPhone}; Relation: ${ecRelation}`.trim();
      }
    }

    const employeeApiData: EmployeeCreateData = { 
        employeeCode: data.employeeCode,
        firstName: firstName,
        lastName: lastName,
        companyEmail: data.email || '', 
        phoneNumber: data.phone || null, // Match API spec (nullable)
        address: data.address || null, // Match API spec (nullable)
        birthDate: data.birthDate || null, // Match API spec (nullable)
        hireDate: data.hireDate || null, // Match API spec (nullable)
        internalAccount: data.userId || null, // Match API spec (nullable) - assuming data.userId is internalAccount
        profilePictureUrl: data.avatar || null, // Match API spec (nullable)
        userId: employeeData?.userId || null, // System user ID, if available from fetched data
        emergencyContact: emergencyContactString || null, // Match API spec (nullable)
        position: data.position || null, // Match API spec (nullable)
        teamId: data.teamId ? Number(data.teamId) : undefined, // undefined if not set
        reportingLeaderId: data.reportingLeaderId ? Number(data.reportingLeaderId) : undefined, // undefined if not set
        currentStatus: data.status || (mode === 'create' ? 'Available' : (employeeData?.currentStatus || 'Available')), // Use status from form
    };

    try {
      let savedEmployeeResponse: NewEmployeeApiResponse;
      if (mode === 'create') {
        console.log('[EmployeeForm REINTEGRATING SKILLS] Creating employee with data:', employeeApiData);
        savedEmployeeResponse = await employeeServiceFromHook.createEmployee(employeeApiData);
        console.log('[EmployeeForm REINTEGRATING SKILLS] Create employee success:', savedEmployeeResponse);
      } else if (employeeId) {
        console.log(`[EmployeeForm REINTEGRATING SKILLS] Updating employee ${employeeId} with data:`, employeeApiData);
        // For update, ensure only changed fields or all fields are sent as per API spec for PUT
        // EmployeeUpdateData might be more appropriate if API supports partial updates
        savedEmployeeResponse = await employeeServiceFromHook.updateEmployee(employeeId.toString(), employeeApiData as Partial<EmployeeCreateData>); 
        console.log('[EmployeeForm REINTEGRATING SKILLS] Update employee success:', savedEmployeeResponse);
      } else {
        throw new Error('Invalid mode or missing employeeId for submission.');
      }

      const finalEmployeeId = savedEmployeeResponse.id.toString();
      
      // --- Start: Status Update Logic ---
      // Check if a status update is needed and if there's a status value from the form
      if (data.status && finalEmployeeId) {
        let statusSpecificStartDate: string | null = null;
        let statusSpecificExpectedEndDate: string | null = null;

        if (data.status === 'Allocated' || data.status === 'Ending Soon') {
          statusSpecificStartDate = data.statusProjectStartDate || null;
          statusSpecificExpectedEndDate = data.statusProjectEndDate || null;
        } else if (data.status === 'On Leave') {
          statusSpecificStartDate = data.leaveStartDate || null;
          statusSpecificExpectedEndDate = data.leaveEndDate || null;
        } else if (data.status === 'Resigned') {
          // For 'Resigned', typically only an end date (resignationDate) is relevant as 'expectedEndDate' of the employment.
          statusSpecificExpectedEndDate = data.resignationDate || null;
          // startDate might be null or hireDate depending on interpretation of status log for resignation
        }

        const statusUpdatePayload: StatusUpdateRequest = { // Explicitly typed with StatusUpdateRequest
          status: data.status,
          projectName: (data.status === 'Allocated' || data.status === 'Ending Soon') ? data.statusProjectName || null : null,
          clientName: (data.status === 'Allocated' || data.status === 'Ending Soon') ? data.statusClientName || null : null,
          startDate: statusSpecificStartDate,
          expectedEndDate: statusSpecificExpectedEndDate,
          allocationPercentage: (data.status === 'Allocated' || data.status === 'Ending Soon') ? (data.statusAllocationPercentage ? Number(data.statusAllocationPercentage) : null) : null,
          isBillable: (data.status === 'Allocated' || data.status === 'Ending Soon') ? data.statusIsBillable || false : null,
          contractId: (data.status === 'Allocated' || data.status === 'Ending Soon') ? (data.statusProjectContractId ? Number(data.statusProjectContractId) : null) : null,
          note: data.statusNote || null,
        };

        // Determine if an actual status update call is necessary.
        // This could be based on whether the status changed from the original, or if project/note details were added/changed.
        // For simplicity, we'll proceed if data.status has a value. More sophisticated checks can be added.
        // A check against original employeeData.currentStatus and other relevant original log data would be ideal.
        let shouldUpdateStatus = true; 
        if (mode === 'edit' && employeeData) {
            if (employeeData.currentStatus === statusUpdatePayload.status && 
                !statusUpdatePayload.note && 
                !(statusUpdatePayload.projectName && (data.status === 'Allocated' || data.status === 'Ending Soon')) &&
                !(statusUpdatePayload.startDate && (data.status === 'On Leave' || data.status === 'Resigned'))
            ) {
                 // Example: If status is same and no new note or project/leave details, maybe don't call.
                 // This is a basic check, real check would compare all fields of StatusUpdateRequest with current latest log.
                 // console.log('[EmployeeForm] No significant status change detected, skipping status API call.');
                 // shouldUpdateStatus = false; // Uncomment to enable skipping
            }
        }

        if (shouldUpdateStatus) {
            console.log(`[EmployeeForm] Attempting to update/log status for employee ${finalEmployeeId} with payload:`, statusUpdatePayload);
            try {
            // IMPORTANT: Ensure 'updateEmployeeStatusAndLog' method exists on employeeServiceFromHook
            // and it matches the API POST /employee-status-logs/employees/{employeeId}/status
            // If not, this will fail. This is an assumed method.
            // const statusResponse = await employeeServiceFromHook.updateEmployeeStatusAndLog(finalEmployeeId, statusUpdatePayload);
            
            // TODO: The call below uses 'updateEmployeeStatus' which might only update the main employee status 
            // and NOT create a detailed status log entry. 
            // For full status logging (via POST /employee-status-logs/employees/{employeeId}/status),
            // ensure 'EmployeeService' has a method like 'updateEmployeeStatusAndLog(employeeId, payload)'
            // that calls the correct logging API, and then revert to using that method here.
            const statusResponse = await employeeServiceFromHook.updateEmployeeStatus(finalEmployeeId, statusUpdatePayload);
            console.log('[EmployeeForm] Status update success (potentially without detailed log):', statusResponse);
            
            // Mocking the call for now as the actual service method is not confirmed
            // await new Promise(resolve => setTimeout(resolve, 500)); // Commented out or remove

            } catch (statusApiError: any) {
                console.error('[EmployeeForm] Error during status update/log API call:', statusApiError);
                // Append to existing errors or set new one, but don't block navigation if main save was ok.
                setError(prev => prev ? `${prev}\nLỗi cập nhật trạng thái: ${statusApiError.message}` : `Lỗi cập nhật trạng thái: ${statusApiError.message}`);
            }
        }
      }
      // --- End: Status Update Logic ---

      if (finalEmployeeId && skillService) {
        console.log(`[EmployeeForm REINTEGRATING SKILLS] Processing skills for employee ID: ${finalEmployeeId}`);
        
        const skillsToDelete = initialSkillsForComparison.filter(
          initialSkill => !skills.some(currentSkill => currentSkill.skillId === initialSkill.skillId)
        );

        const skillPromises: Promise<any>[] = [];

        skillsToDelete.forEach(skillDetail => {
          console.log(`[EmployeeForm REINTEGRATING SKILLS] Deleting skill ID: ${skillDetail.skillId}, Name: ${skillDetail.skillName}`);
          // Assuming deleteEmployeeSkill signature is (employeeId: string, employeeSkillId: string)
          // or (employeeId: string, skillId: string) - check service definition
          // EmployeeSkillDetail.id is the EmployeeSkillDto.id (the link table record id)
          if (skillDetail.id) { // Ensure we have the EmployeeSkill ID to delete
             skillPromises.push(skillService.deleteEmployeeSkill(finalEmployeeId, skillDetail.id.toString()));
          } else {
             console.warn(`[EmployeeForm REINTEGRATING SKILLS] Cannot delete skill ${skillDetail.skillName} as it doesn't have an existing employeeSkillId (link table ID).`);
          }
        });

        skills.forEach(currentSkill => {
          const apiPayload: EmployeeSkillCreateData = {
            skillId: currentSkill.skillId,
            yearsExperience: currentSkill.years ?? null, // Use ?? null to ensure number | null
            selfAssessmentLevel: currentSkill.level as string ?? null, // Cast SkillLevel to string, then ?? null
            selfComment: currentSkill.selfComment || null,
            leaderAssessmentLevel: currentSkill.leaderAssessment || null,
            leaderComment: currentSkill.leaderComment || null,
          };

          const isExistingAssociation = initialSkillsForComparison.some(
            initialSkill => initialSkill.skillId === currentSkill.skillId
          );
          
          if (isExistingAssociation) {
            const originalSkill = initialSkillsForComparison.find(is => is.skillId === currentSkill.skillId);
            const originalPayload: EmployeeSkillCreateData | null = originalSkill ? {
                skillId: originalSkill.skillId,
                yearsExperience: originalSkill.yearsExperience ?? null,
                selfAssessmentLevel: originalSkill.selfAssessmentLevel as string ?? null,
                selfComment: originalSkill.selfComment || null,
                leaderAssessmentLevel: originalSkill.leaderAssessmentLevel || null,
                leaderComment: originalSkill.leaderComment || null,
            } : null;

            // Only update if something changed. JSON.stringify might be too simple for deep comparison or specific logic.
            if (JSON.stringify(apiPayload) !== JSON.stringify(originalPayload)) {
                 console.log(`[EmployeeForm REINTEGRATING SKILLS] Updating skill ID: ${currentSkill.skillId} with payload:`, apiPayload);
                 // Assuming addOrUpdateEmployeeSkill(employeeId, payload) where payload contains skillId for upsert
                 skillPromises.push(skillService.addOrUpdateEmployeeSkill(finalEmployeeId, apiPayload));
            } else {
                 console.log(`[EmployeeForm REINTEGRATING SKILLS] Skill ID: ${currentSkill.skillId} - no changes detected, skipping update.`);
            }
          } else {
            console.log(`[EmployeeForm REINTEGRATING SKILLS] Adding new skill ID: ${currentSkill.skillId} with payload:`, apiPayload);
            skillPromises.push(skillService.addOrUpdateEmployeeSkill(finalEmployeeId, apiPayload));
          }
        });

        try {
          await Promise.all(skillPromises);
          console.log('[EmployeeForm REINTEGRATING SKILLS] All skill operations completed.');
        } catch (skillError: any) {
          console.error('[EmployeeForm REINTEGRATING SKILLS] Error during skill operations:', skillError);
          setError(prev => prev ? `${prev}\nLỗi khi lưu kỹ năng: ${skillError.message}` : `Lỗi khi lưu kỹ năng: ${skillError.message}`);
          // Do not re-throw, allow main navigation to proceed if employee save was successful
        }
      }

      if (mode === 'create') {
        navigate('/hrm/employees');
      } else {
        navigate(`/hrm/employees/${finalEmployeeId}`);
      }

    } catch (err: any) {
      console.error('[EmployeeForm REINTEGRATING SKILLS] Error saving employee (main data):', err);
      setError(`Lưu thất bại: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Ensure the main return statement for the component is present and correct
  return (
    <FormProvider {...formMethods}>
      <form onSubmit={formMethods.handleSubmit(onSubmit)}>
        <div className="space-y-8 divide-y divide-gray-200">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {mode === 'create' ? 'Thêm mới Nhân viên' : 'Cập nhật thông tin Nhân viên'}
              </h3>
            </div>
            
            {error && (
              <div className="rounded-md bg-red-50 p-4 text-red-700 whitespace-pre-line">
                {/* Ensure error is a string or can be rendered */}
                Error: {typeof error === 'object' ? JSON.stringify(error) : error}
              </div>
            )}
            
            {(isLoadingEmployee || (mode === 'edit' && isLoadingSkills)) && (
              <div className="flex justify-center py-4">Loading employee data...</div>
            )}

            {(!isLoadingEmployee && !(mode === 'edit' && isLoadingSkills) || mode === 'create') && (
              <>
                <BasicInfoSection isEditable={canEdit} mode={mode} />
                <OrganizationSection 
                  isEditable={canEdit} 
                  potentialLeaders={potentialLeaders} 
                  isLoadingLeaders={isLoadingLeaders} 
                />
                <SkillsSection 
                  isEditable={canEdit} 
                  skills={skills} 
                  onSkillsChange={handleSkillsChange}
                  userRole={user?.role as string | string[] | undefined} 
                />
                <StatusSection isEditable={canEdit} />
              </>
            )}
            
            <div className="flex justify-end space-x-3 pt-5">
              <button type="button" onClick={() => navigate('/hrm/employees')} disabled={isSubmitting}>
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !canEdit || isLoadingEmployee || isLoadingLeaders || (mode === 'edit' && isLoadingSkills)}
              >
                {isSubmitting ? 'Đang xử lý...' : (mode === 'create' ? 'Tạo nhân viên' : 'Cập nhật')}
              </button>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default EmployeeForm;
