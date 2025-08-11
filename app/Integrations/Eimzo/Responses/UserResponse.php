<?php

namespace App\Integrations\Eimzo\Responses;

use App\Integrations\Traits\AutoSetTrait;

class UserResponse
{
    use AutoSetTrait;

    public ?array $subjectName = [];
    public function __construct(array $data = []){
        $this->loadPropertiesDynamically($data);
    }

    public function getSubject(): array{
        return $this->subjectName;
    }


    public function getPin(): string{
        return $this->getSubject()['1.2.860.3.16.1.2'];
    }

    public function getName(): string{
        return $this->getSubject()['CN'];
    }


}
