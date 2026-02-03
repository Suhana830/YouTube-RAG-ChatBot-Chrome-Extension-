from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from dotenv import load_dotenv

video_id = "vsWrXfO3wWw"
load_dotenv()

llm = ChatOpenAI()
parser = StrOutputParser()
prompt = PromptTemplate(
    template="""
You are a helpful assistant chatting about a YouTube video.

Use the provided CONTEXT to answer the USER QUESTION **only if the context is relevant**.

Rules:
1. If the question can be answered using the context, give a clear and concise answer based only on the context.
2. If the context does NOT contain the answer, reply exactly with: "I don't know".
3. If the user is chatting casually (greetings, small talk, opinions) and not asking about the video content, respond naturally using your general knowledge and ignore the context.
4. Do NOT make up facts that are not present in the context.

CONTEXT:
{context}

USER QUESTION:
{query}
""",
    input_variables=["context", "query"]
)


def getResponse(query, video_id):

    try:
        
        ytt_api = YouTubeTranscriptApi()
        fetched_transcript=  ytt_api.fetch(video_id)
        
        transcript = " ".join(chunk.text for chunk in fetched_transcript)   

        splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )

        chunks = splitter.create_documents([transcript])
        embeddings = OpenAIEmbeddings(model="text-embedding-ada-002")

        vector_stores = FAISS.from_documents(
            documents=chunks,
            embedding=embeddings
            
        )

        retriever = vector_stores.as_retriever(search_type="similarity", search_kwargs={"k":1})
        
        context = retriever.invoke(query)
        docs = retriever.invoke(query)
        context_text = "\n\n".join(doc.page_content for doc in context)

        chain = prompt | llm | parser

        # print("context: ", context_text)
        # print(len(chunks))

        result = chain.invoke({'context': context_text, 'query':query})
        # print("result: " , result)
        return {"answer": result}

        
    except TranscriptsDisabled:
        print("Transcript is disabled for this video")
        return "Transcript is disabled for this video"
    except Exception as e:
        print("Some other error:", e)
        return "Some other Error"
