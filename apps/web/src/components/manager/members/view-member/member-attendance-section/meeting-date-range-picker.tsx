'use client';

import { DateTimeRangePicker } from '@/src/components/date-time-range-picker';
import { trpc } from '@/src/trpc/trpc-client';
import type { AttendanceEntrySchema } from '@interval.so/api/app/team_member_attendance/schemas/attendance_entry_schema';
import type { TimeRangeSchema } from '@interval.so/api/app/team_stats/schemas/time_range_schema';
import { type ComponentProps, useState } from 'react';
import { toast } from 'sonner';
import { useDebouncedCallback } from 'use-debounce';

type Props = {
	meeting: Pick<AttendanceEntrySchema, 'attendanceId' | 'startedAt' | 'endedAt'>;
} & Pick<
	ComponentProps<typeof DateTimeRangePicker>,
	'buttonProps' | 'className' | 'disabled' | 'verbose' | 'display' | 'fromDate' | 'icon' | 'picker'
>;

/** A date range picker that updates the start/end time of a meeting after a selection. */
export function MeetingDateRangePicker({ meeting, disabled, ...pickerProps }: Props) {
	const [optimisticValue, setOptimisticValue] = useState<Partial<TimeRangeSchema> | undefined>();

	const updateAttendance = trpc.teams.members.attendance.updateEntry.useMutation({
		onError: (error) => {
			toast.error('An error occurred while saving your changes', {
				description: error.message,
			});
			// Revert optimistic state
			setOptimisticValue(undefined);
		},
	});

	const doUpdate = useDebouncedCallback((value: Partial<{ start: Date; end: Date }>) => {
		if (value.start && value.end) {
			updateAttendance.mutate({
				startedAt: value.start,
				endedAt: value.end,
				attendanceId: meeting.attendanceId,
			});
		}
	}, 750);

	const onSelect = (value: Partial<TimeRangeSchema>) => {
		setOptimisticValue(value);

		// Do nothing if the user didn't select a range, since a range is required
		doUpdate(value);
	};

	const disabledOrPending = disabled || updateAttendance.isPending;

	return (
		<DateTimeRangePicker
			value={
				optimisticValue ?? {
					start: meeting.startedAt,
					end: meeting.endedAt,
				}
			}
			onSelect={onSelect}
			disabled={disabledOrPending}
			{...pickerProps}
		/>
	);
}
