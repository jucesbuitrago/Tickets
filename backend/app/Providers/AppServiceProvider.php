<?php

namespace App\Providers;

use App\Interfaces\SignatureServiceInterface;
use App\Interfaces\TicketRepositoryInterface;
use App\Interfaces\GraduateRepositoryInterface;
use App\Interfaces\EventRepositoryInterface;
use App\Interfaces\AuditoriumRepositoryInterface;
use App\Interfaces\InvitationRepositoryInterface;
use App\Interfaces\QrGeneratorInterface;
use App\Interfaces\MailServiceInterface;
use App\Infrastructure\Repositories\EloquentTicketRepository;
use App\Infrastructure\Repositories\EloquentGraduateRepository;
use App\Infrastructure\Repositories\EloquentEventRepository;
use App\Infrastructure\Repositories\EloquentAuditoriumRepository;
use App\Infrastructure\Repositories\EloquentInvitationRepository;
use App\Services\HmacSignatureService;
use App\Services\QrCodeGenerator;
use App\Services\LaravelMailService;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(TicketRepositoryInterface::class, EloquentTicketRepository::class);
        $this->app->bind(GraduateRepositoryInterface::class, EloquentGraduateRepository::class);
        $this->app->bind(EventRepositoryInterface::class, EloquentEventRepository::class);
        $this->app->bind(AuditoriumRepositoryInterface::class, EloquentAuditoriumRepository::class);
        $this->app->bind(InvitationRepositoryInterface::class, EloquentInvitationRepository::class);
        $this->app->bind(QrGeneratorInterface::class, QrCodeGenerator::class);
        $this->app->bind(MailServiceInterface::class, LaravelMailService::class);
        $this->app->bind(SignatureServiceInterface::class, HmacSignatureService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
