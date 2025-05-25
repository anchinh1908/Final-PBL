from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModel
import torch
import numpy as np

app = FastAPI()

# Load mô hình và tokenizer
model_name = "sentence-transformers/paraphrase-multilingual-mpnet-base-v2"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModel.from_pretrained(model_name)

# Định nghĩa request model
class QueryRequest(BaseModel):
    query: str

def mean_pooling(model_output, attention_mask):
    token_embeddings = model_output.last_hidden_state  # Shape: [batch_size, seq_length, hidden_size]
    input_mask_expanded = attention_mask.unsqueeze(-1).expand(token_embeddings.size()).float()
    return torch.sum(token_embeddings * input_mask_expanded, 1) / torch.clamp(input_mask_expanded.sum(1), min=1e-9)

@app.post("/embed")
async def create_embedding(request: QueryRequest):
    try:
        # Tokenize truy vấn
        inputs = tokenizer(
            request.query,
            padding="max_length",
            max_length=512,
            truncation=True,
            return_tensors="pt"
        )

        # Tạo embedding
        with torch.no_grad():
            outputs = model(**inputs)
            embeddings = mean_pooling(outputs, inputs["attention_mask"])
            embedding = embeddings.squeeze().numpy().tolist()  # Chuyển thành list [768]

        return {"embedding": embedding}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating embedding: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)