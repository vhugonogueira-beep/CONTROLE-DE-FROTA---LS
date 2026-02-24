# Configuração
$anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxaXp0YXpqcnV4dWp3d3V1cGZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwODIyNjEsImV4cCI6MjA4NTY1ODI2MX0.lPayB7cqM4yqvnAd5PsJ44DUWTnIu1nUwkEIaY9JMcA"
$url = "https://hqiztazjruxujwwuupfq.supabase.co/rest/v1/fleet_records"

$headers = @{
    "apikey"        = $anonKey
    "Authorization" = "Bearer $anonKey"
    "Content-Type"  = "application/json"
    "Prefer"        = "return=representation"
}

# Tenta inserir um registro com as novas colunas e campos obrigatórios
$body = @{
    veiculo                 = "DIAGNOSTIC_PHOTOS"
    status                  = "agendado"
    data_inicial            = "2026-02-23"
    horario_inicial         = "23:00"
    data_final              = "2026-02-24"
    horario_final           = "08:00"
    destino                 = "TEST"
    km_inicial              = 100
    km_final                = 0
    atividade               = "DIAGNOSTIC"
    lavagem                 = "pendente"
    tanque                  = "cheio"
    andar_estacionado       = "P"
    responsavel             = "DIAGNOSTIC_TOOL"
    foto_painel_inicial_url = "https://test.com/initial.jpg"
    foto_painel_final_url   = "https://test.com/final.jpg"
} | ConvertTo-Json

Write-Host "Testando INSERT com todas as colunas..."

try {
    $response = Invoke-RestMethod -Uri $url -Method Post -Headers $headers -Body $body
    Write-Host "SUCESSO: As novas colunas de fotos existem!" -ForegroundColor Green
    
    # Deletar o registro de teste
    $id = $response[0].id
    Invoke-RestMethod -Uri "$url?id=eq.$id" -Method Delete -Headers $headers
    Write-Host "Registro de teste removido."
}
catch {
    Write-Host "ERRO DETECTADO:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    if ($_.Exception.Response) {
        $streamReader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $errorBody = $streamReader.ReadToEnd()
        Write-Host "Detalhes: $errorBody"
    }
    else {
        Write-Host "Sem resposta do servidor."
    }
}
