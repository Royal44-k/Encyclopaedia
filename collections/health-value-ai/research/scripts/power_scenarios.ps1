# Planning scenarios only: two independent equally sized groups.
# Normal approximation, two-sided alpha 0.05, power 0.80.
# No cluster design effect, multiplicity, or ANCOVA gain assumed.
$zAlpha = 1.959963984540054
$zPower = 0.8416212335729143
$missingFraction = 0.20
$scenarioRows = foreach ($effectD in @(0.20, 0.30)) {
    $completePerArm = [int][math]::Ceiling(2 * [math]::Pow($zAlpha + $zPower, 2) / [math]::Pow($effectD, 2))
    $recruitPerArm = [int][math]::Ceiling($completePerArm / (1 - $missingFraction))
    [pscustomobject]@{
        assumed_standardized_effect = $effectD
        alpha_two_sided = 0.05
        target_power = 0.80
        complete_per_arm = $completePerArm
        complete_total = 2 * $completePerArm
        assumed_missing_fraction = $missingFraction
        recruit_per_arm = $recruitPerArm
        recruit_total = 2 * $recruitPerArm
        status = 'planning_assumption_not_observed_result'
    }
}
$researchDirectory = Split-Path -Parent $PSScriptRoot
$scenarioPath = Join-Path $researchDirectory '样本量规划情景.csv'
$scenarioRows | Export-Csv -LiteralPath $scenarioPath -NoTypeInformation -Encoding UTF8
$scenarioRows | Format-Table assumed_standardized_effect,complete_per_arm,complete_total,recruit_total
