document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('sportvault_token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const itemId = urlParams.get('id');

    if (!itemId) {
        alert("ID do item não fornecido!");
        window.location.href = 'listar_itens.html';
        return;
    }

    const loading = document.getElementById('loading-feedback');
    const detailsDiv = document.getElementById('item-details');

    // Fetch Item
    try {
        const res = await fetch(`http://127.0.0.1:5000/api/itens/${itemId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();

        loading.hidden = true;

        if (data.sucesso && data.item) {
            const item = data.item;
            detailsDiv.hidden = false;

            document.getElementById('detalhe-nome').textContent = item.nome;
            document.getElementById('detalhe-esporte').textContent = item.esporte;
            document.getElementById('detalhe-tipo').textContent = item.tipo;
            document.getElementById('detalhe-ano').textContent = item.ano_artigo || 'Não informado';
            document.getElementById('detalhe-estado').textContent = item.estado_conservacao;
            document.getElementById('detalhe-descricao').textContent = item.descricao || 'Nenhuma descrição informada.';
            
            // Format date if needed
            const dateStr = new Date(item.data_cadastro).toLocaleString('pt-BR');
            document.getElementById('detalhe-data').textContent = dateStr;

            // Setup Edit Link
            document.getElementById('btn-editar').href = `editar_item.html?id=${item.id}`;

            // Setup Delete Action
            document.getElementById('btn-deletar').addEventListener('click', async () => {
                const confirmed = confirm(`Tem certeza que deseja excluir o item "${item.nome}"? Essa ação não pode ser desfeita.`);
                if (confirmed) {
                    try {
                        const delRes = await fetch(`http://127.0.0.1:5000/api/itens/${itemId}`, {
                            method: 'DELETE',
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        const delData = await delRes.json();
                        
                        if (delData.sucesso) {
                            alert("Item deletado com sucesso!");
                            window.location.href = 'listar_itens.html';
                        } else {
                            alert("Erro ao deletar: " + delData.mensagem);
                        }
                    } catch (e) {
                        alert("Erro de rede ao tentar deletar o item.");
                    }
                }
            });

        } else {
            loading.hidden = false;
            loading.textContent = "Erro: " + (data.mensagem || "Item não encontrado.");
        }
    } catch (e) {
        loading.hidden = false;
        loading.textContent = "Erro de conexão com o servidor.";
    }
});
