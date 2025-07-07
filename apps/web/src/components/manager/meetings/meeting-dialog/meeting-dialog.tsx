import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import type { TeamMeetingSchema } from '@interval.so/api/app/team_meeting/schemas/team_meeting_schema';
import { useQueryStates } from 'nuqs';
import { type PropsWithChildren, useContext } from 'react';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { searchParamParsers } from '../search-params';
import { MeetingDialogChangesContext, MeetingDialogChangesProvider } from './meeting-dialog-changes-context';
import { MeetingDialogContent } from './meeting-dialog-content';

type Props = PropsWithChildren<{
	team: Pick<TeamSchema, 'slug'>;
	meeting: TeamMeetingSchema;
}>;

export function MeetingDialog({ meeting, team, children }: Props) {
	return (
		<MeetingDialogChangesProvider>
			<MeetingDialogInner meeting={meeting} team={team}>
				{children}
			</MeetingDialogInner>
		</MeetingDialogChangesProvider>
	);
}

function MeetingDialogInner({ meeting, children, team }: Props) {
	const [queryStates, setQueryStates] = useQueryStates(searchParamParsers);
	const changes = useContext(MeetingDialogChangesContext);

	const open =
		queryStates.dialogStart?.getTime() === meeting.startedAt.getTime() &&
		queryStates.dialogEnd?.getTime() === meeting.endedAt?.getTime();

	const closeDialog = () => {
		setQueryStates({
			dialogStart: null,
			dialogEnd: null,
		});
		changes.clearUpdatedMeetings();
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(open) => {
				if (open) {
					setQueryStates({
						dialogStart: meeting.startedAt,
						dialogEnd: meeting.endedAt,
					});
				} else {
					closeDialog();
				}
			}}
		>
			<DialogTrigger asChild={true}>{children}</DialogTrigger>

			<MeetingDialogContent meeting={meeting} closeDialog={closeDialog} team={team} />
		</Dialog>
	);
}
