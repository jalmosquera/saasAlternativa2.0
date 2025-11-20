"""Management command to reset database and seed with demo data.

This module provides a Django management command that performs a complete
database reset: flush all data, apply migrations, and populate with demo data.
This is particularly useful for development and testing environments.
"""

from django.core.management.base import BaseCommand
from django.core.management import call_command


class Command(BaseCommand):
    """Django management command to flush database and seed demo data.

    This command performs a complete database reset in a single operation:
    1. Flush all existing data from the database
    2. Apply all database migrations
    3. Seed the database with demo data

    All operations are non-interactive, making this command suitable for
    automated workflows and development environment setup.

    Command Purpose:
        Provide a one-step solution to reset the database to a clean state
        with fresh demo data. Ideal for:
        - Development environment setup
        - Testing scenarios requiring clean data
        - Demonstration purposes
        - Resetting to known state after experiments

    Usage:
        Basic usage:
            python manage.py flush_and_seed

        From another management command:
            from django.core.management import call_command
            call_command('flush_and_seed')

    Examples:
        Command line execution:
            $ python manage.py flush_and_seed
            Flushing database...
            Applying migrations...
            Seeding demo data...
            Database flushed and demo data seeded.

        Use in a shell script for CI/CD:
            #!/bin/bash
            python manage.py flush_and_seed
            python manage.py runserver

    Notes:
        - WARNING: This command DESTROYS ALL DATA in the database
        - Runs in non-interactive mode (no confirmation prompts)
        - NOT suitable for production environments
        - Executes operations in sequence: flush -> migrate -> seed_demo
        - Requires 'seed_demo' management command to be available
        - All flush and migrate operations use --no-input flag

    Attributes:
        help (str): Short description displayed in management command help.

    See Also:
        - seed_demo: Command for seeding demo data only
        - Django's flush command: Removes all data from database
        - Django's migrate command: Applies database migrations
    """

    help = "Flush DB (non-interactive), migrate and seed demo data."

    def handle(self, *args, **options) -> None:
        """Execute the complete database reset and seeding process.

        This is the main entry point for the management command. It orchestrates
        three sequential operations: database flush, migration application, and
        demo data seeding. All operations run non-interactively.

        Args:
            *args: Variable length argument list (unused).
            **options: Arbitrary keyword arguments from command line options.

        Returns:
            None

        Raises:
            CommandError: If any of the called commands (flush, migrate,
                seed_demo) fails during execution.

        Note:
            - Each step is logged to stdout with appropriate styling
            - If any step fails, the command will stop and raise an error
            - No transaction wrapping; each called command handles its own
        """
        self.stdout.write(self.style.MIGRATE_HEADING("Flushing database..."))
        call_command('flush', '--no-input')

        self.stdout.write(self.style.MIGRATE_HEADING("Applying migrations..."))
        call_command('migrate', '--no-input')

        self.stdout.write(self.style.MIGRATE_HEADING("Seeding demo data..."))
        call_command('seed_demo')

        self.stdout.write(
            self.style.SUCCESS("Database flushed and demo data seeded.")
        )





