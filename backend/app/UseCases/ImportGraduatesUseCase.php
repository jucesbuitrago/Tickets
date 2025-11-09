<?php

namespace App\UseCases;

use App\Entities\Graduate;
use App\Interfaces\GraduateRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Collection;

class ImportGraduatesUseCase
{
    public function __construct(
        private GraduateRepositoryInterface $graduateRepository,
    ) {}

    public function execute(Collection $graduatesData): array
    {
        $results = [
            'imported' => 0,
            'errors' => [],
        ];

        DB::transaction(function () use ($graduatesData, &$results) {
            foreach ($graduatesData as $index => $data) {
                try {
                    $this->validateGraduateData($data);

                    $graduate = new Graduate(
                        id: 0,
                        userId: $data['user_id'],
                        cuposPermitidos: $data['cupos_permitidos'],
                        cuposUsados: 0,
                    );

                    $this->graduateRepository->save($graduate);
                    $results['imported']++;

                } catch (\Exception $e) {
                    $results['errors'][] = [
                        'row' => $index + 1,
                        'error' => $e->getMessage(),
                        'data' => $data,
                    ];
                }
            }
        });

        return $results;
    }

    private function validateGraduateData(array $data): void
    {
        if (!isset($data['user_id']) || !is_int($data['user_id'])) {
            throw new \Exception('user_id es requerido y debe ser un entero');
        }

        if (!isset($data['cupos_permitidos']) || !is_int($data['cupos_permitidos']) || $data['cupos_permitidos'] < 0) {
            throw new \Exception('cupos_permitidos es requerido y debe ser un entero positivo');
        }
    }
}