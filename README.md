# To run

bash
```
rm -f app.db
rm -f mlflow.db
pip3 install -r requirements.txt
uvicorn app.main:app --reload
python3 -m scripts.indian_seed_generator.py
```

## Then watch the 127.0.0.0.0:8000 port 
and then try out the POST request in the ML Ops section you will be able to see the ML Ops pipeline
