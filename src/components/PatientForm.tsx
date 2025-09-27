import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

export interface PatientFormData {
  name: string;
  dateOfBirth: Date | undefined;
  gender: 'Male' | 'Female' | 'Other' | '';
  contactNumber: string;
  doctorName: string;
  address: string;
  lensCategory: 'RGP' | 'Scleral lens' | '';
  medicalRecordNumber: string;
  notes?: string;
  dateOfVisit?: Date;
  diagnosis?: string; // New field for diagnosis
}

interface PatientFormProps {
  initialData?: PatientFormData;
  onSubmit: (data: PatientFormData) => void;
  onCancel: () => void;
}

const PatientForm: React.FC<PatientFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [gender, setGender] = useState<PatientFormData['gender']>(initialData?.gender || '');
  const [contactNumber, setContactNumber] = useState(initialData?.contactNumber || '');
  const [doctorName, setDoctorName] = useState(initialData?.doctorName || '');
  const [address, setAddress] = useState(initialData?.address || '');
  const [lensCategory, setLensCategory] = useState<PatientFormData['lensCategory']>(initialData?.lensCategory || '');
  const [medicalRecordNumber, setMedicalRecordNumber] = useState(initialData?.medicalRecordNumber || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [dateOfVisit, setDateOfVisit] = useState<Date | undefined>(initialData?.dateOfVisit);
  const [diagnosis, setDiagnosis] = useState(initialData?.diagnosis || ''); // New state for diagnosis

  useEffect(() => {
    if (initialData?.dateOfBirth) {
      const dob = initialData.dateOfBirth;
      setDay(dob.getDate().toString());
      setMonth((dob.getMonth() + 1).toString()); // Month is 0-indexed
      setYear(dob.getFullYear().toString());
    }
    if (initialData?.lensCategory) {
      setLensCategory(initialData.lensCategory);
    }
    if (initialData?.medicalRecordNumber) {
      setMedicalRecordNumber(initialData.medicalRecordNumber);
    }
    if (initialData?.dateOfVisit) {
      setDateOfVisit(initialData.dateOfVisit);
    }
    if (initialData?.diagnosis) {
      setDiagnosis(initialData.diagnosis);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let parsedDateOfBirth: Date | undefined = undefined;
    const dayNum = parseInt(day, 10);
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);

    // Basic validation for date components
    if (
      !isNaN(dayNum) && !isNaN(monthNum) && !isNaN(yearNum) &&
      dayNum > 0 && dayNum <= 31 &&
      monthNum > 0 && monthNum <= 12 &&
      yearNum >= 1900 && yearNum <= new Date().getFullYear() + 5 // A reasonable year range
    ) {
      const tempDate = new Date(yearNum, monthNum - 1, dayNum);
      // Check to ensure the date components match, preventing rollovers (e.g., Feb 30 becoming Mar 1)
      if (
        tempDate.getFullYear() === yearNum &&
        tempDate.getMonth() === (monthNum - 1) &&
        tempDate.getDate() === dayNum
      ) {
        parsedDateOfBirth = tempDate;
      }
    }

    onSubmit({
      name,
      dateOfBirth: parsedDateOfBirth,
      gender,
      contactNumber,
      doctorName,
      address,
      lensCategory,
      medicalRecordNumber,
      notes,
      dateOfVisit,
      diagnosis, // Pass diagnosis
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div>
        <Label htmlFor="name">Patient Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="medicalRecordNumber">Medical Record Number</Label>
        <Input id="medicalRecordNumber" value={medicalRecordNumber} onChange={(e) => setMedicalRecordNumber(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="diagnosis">Diagnosis</Label>
        <Input id="diagnosis" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="e.g., Keratoconus, Myopia" />
      </div>
      <div>
        <Label>Date of Birth</Label>
        <div className="flex space-x-2">
          <Input
            id="dob-day"
            placeholder="DD"
            value={day}
            onChange={(e) => setDay(e.target.value.slice(0, 2))}
            maxLength={2}
            className="w-1/3"
          />
          <Input
            id="dob-month"
            placeholder="MM"
            value={month}
            onChange={(e) => setMonth(e.target.value.slice(0, 2))}
            maxLength={2}
            className="w-1/3"
          />
          <Input
            id="dob-year"
            placeholder="YYYY"
            value={year}
            onChange={(e) => setYear(e.target.value.slice(0, 4))}
            maxLength={4}
            className="w-1/3"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="dateOfVisit">Date of Visit</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !dateOfVisit && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateOfVisit ? format(dateOfVisit, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={dateOfVisit}
              onSelect={setDateOfVisit}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <div>
        <Label htmlFor="gender">Gender</Label>
        <Select value={gender} onValueChange={(value: PatientFormData['gender']) => setGender(value)}>
          <SelectTrigger id="gender">
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Male">Male</SelectItem>
            <SelectItem value="Female">Female</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="contactNumber">Contact Number</Label>
        <Input id="contactNumber" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="doctorName">Doctor's Name</Label>
        <Input id="doctorName" value={doctorName} onChange={(e) => setDoctorName(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="lensCategory">Lens Category</Label>
        <Select value={lensCategory} onValueChange={(value: PatientFormData['lensCategory']) => setLensCategory(value)}>
          <SelectTrigger id="lensCategory">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="RGP">RGP</SelectItem>
            <SelectItem value="Scleral lens">Scleral lens</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="address">Address</Label>
        <Textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any additional notes..." />
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save Patient</Button>
      </div>
    </form>
  );
};

export default PatientForm;