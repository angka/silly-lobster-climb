import React, { useState, useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, isSameDay, parseISO } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Phone, User, Activity, Eye } from 'lucide-react';

interface ScheduledPatient {
  id: string;
  name: string;
  phone: string;
  diagnosis: string;
  lensType: string;
  mrn: string;
  followUpDate: Date;
}

const FollowUpCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const scheduledPatients = useMemo(() => {
    const storedPatients = localStorage.getItem('patients');
    const storedSessions = localStorage.getItem('sessions');
    
    if (!storedPatients || !storedSessions) return [];

    const patients = JSON.parse(storedPatients);
    const sessions = JSON.parse(storedSessions);

    const scheduled: ScheduledPatient[] = [];

    sessions.forEach((session: any) => {
      if (session.data && session.data.nextFollowUpDate) {
        const patient = patients.find((p: any) => p.id === session.patientId);
        if (patient) {
          scheduled.push({
            id: patient.id,
            name: patient.name,
            phone: patient.contactNumber || 'N/A',
            diagnosis: patient.diagnosis || 'N/A',
            lensType: session.lensType || patient.lensCategory || 'N/A',
            mrn: patient.medicalRecordNumber,
            followUpDate: new Date(session.data.nextFollowUpDate)
          });
        }
      }
    });

    return scheduled;
  }, []);

  const patientsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return scheduledPatients.filter(p => isSameDay(p.followUpDate, selectedDate));
  }, [selectedDate, scheduledPatients]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      const hasPatients = scheduledPatients.some(p => isSameDay(p.followUpDate, date));
      if (hasPatients) {
        setIsDialogOpen(true);
      }
    }
  };

  // Custom day renderer to show indicators
  const modifiers = {
    hasAppointment: (date: Date) => scheduledPatients.some(p => isSameDay(p.followUpDate, date))
  };

  const modifiersStyles = {
    hasAppointment: {
      fontWeight: 'bold',
      backgroundColor: 'hsl(var(--primary) / 0.1)',
      color: 'hsl(var(--primary))',
      borderRadius: '50%'
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Follow-up Schedule
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          className="rounded-md border shadow"
          modifiers={modifiers}
          modifiersStyles={modifiersStyles}
        />
        
        <div className="mt-4 w-full">
          <h4 className="text-sm font-medium mb-2">Upcoming Today ({patientsForSelectedDate.length})</h4>
          {patientsForSelectedDate.length > 0 ? (
            <div className="space-y-2">
              {patientsForSelectedDate.map((p, i) => (
                <div key={i} className="text-sm p-2 bg-muted rounded-md flex justify-between items-center">
                  <span>{p.name}</span>
                  <Badge variant="outline">{p.lensType}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No appointments for selected date.</p>
          )}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                Appointments for {selectedDate ? format(selectedDate, 'PPP') : ''}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {patientsForSelectedDate.map((p, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        <span className="font-bold text-lg">{p.name}</span>
                      </div>
                      <Badge>{p.lensType}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">MRN:</span> {p.mrn}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Phone:</span> {p.phone}
                      </div>
                      <div className="flex items-center gap-2 col-span-2">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Diagnosis:</span> {p.diagnosis}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default FollowUpCalendar;