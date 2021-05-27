#!/usr/bin/perl

$cmd = "docker image ls";
open(CMD, "$cmd 2>&1 |") or die "ERROR: $!\n";
while ( <CMD> ) {
	my $line = $_;
	chomp $line;
	$line =~ s/\r//g;
	next unless ($line =~ m/^(\S+)\s+(\S+)\s+(\S+)\s/i);
	my ($name, $ver, $id) = ($1, $2, $3);
	next unless ($ver =~ m/^<none>$/);
	print "removing: $id, $ver, $name\n";
	if (system("docker rmi $id") == 0) {
		print " . ok\n";
	} else {
		print " . FAILED\n";
	}
}
close CMD;
